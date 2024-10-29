import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const Chat = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState('');
  const chatWindowRef = useRef(null);

  // Fetch contacts with listeners for new messages
  useEffect(() => {
    if (!userId) return;

    const userDocRef = firestore.collection('users').doc(userId);

    const unsubscribe = userDocRef.collection('contacts').onSnapshot(snapshot => {
      const loadedContacts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        hasNewMessage: false, // Initial state for notifications
      }));
      setContacts(loadedContacts);
    });

    return unsubscribe;
  }, [userId]);

  // Listen for new messages and update notification state
  useEffect(() => {
    const unsubscribes = contacts.map(contact => {
      const chatId = [userId, contact.id].sort().join('_');
      return firestore
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot(snapshot => {
          const newMessages = snapshot.docs.map(doc => doc.data());

          // Mark as "new" only if it's the latest message from the contact and chat is unopened
          if (newMessages.length > 0) {
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.sender !== userId && contact.id !== selectedContact?.id) {
              setContacts(prevContacts =>
                prevContacts.map(c =>
                  c.id === contact.id ? { ...c, hasNewMessage: true } : c
                )
              );
            }
          }
        });
    });

    return () => unsubscribes.forEach(unsubscribe => unsubscribe && unsubscribe());
  }, [contacts, userId, selectedContact]);

  // Load messages for the selected contact, mark as read
  useEffect(() => {
    if (!selectedContact || !userId) return;

    const chatId = [userId, selectedContact.id].sort().join('_');
    const messagesRef = firestore
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('timestamp', 'asc');

    const unsubscribe = messagesRef.onSnapshot(snapshot => {
      const loadedMessages = snapshot.docs.map(doc => doc.data());
      setMessages(loadedMessages);
    });

    // Clear notification for selected contact
    setContacts(prevContacts =>
      prevContacts.map(contact =>
        contact.id === selectedContact.id ? { ...contact, hasNewMessage: false } : contact
      )
    );

    return unsubscribe;
  }, [selectedContact, userId]);

  // Send a message to the current chat
  const handleSendMessage = async () => {
    if (message.trim() === '' || !selectedContact) return;

    const chatId = [userId, selectedContact.id].sort().join('_');
    const newMessage = {
      text: message,
      sender: userId,
      timestamp: new Date(),
    };

    await firestore.collection('chats').doc(chatId).collection('messages').add(newMessage);
    setMessage('');
  };

  // Add a new contact to the sidebar
  const handleAddContact = async () => {
    if (!newContact.trim()) return;

    if (contacts.some(contact => contact.email === newContact)) {
      alert('Contact already exists');
      setNewContact('');
      setShowAddContact(false);
      return;
    }

    try {
      const contactRef = await firestore
        .collection('users')
        .where('email', '==', newContact)
        .get();

      if (!contactRef.empty) {
        const contactData = contactRef.docs[0].data();
        const contactId = contactRef.docs[0].id;

        await firestore
          .collection('users')
          .doc(userId)
          .collection('contacts')
          .doc(contactId)
          .set({
            image: contactData.image || 'https://via.placeholder.com/50',
            email: contactData.email,
          });

        await firestore
          .collection('users')
          .doc(contactId)
          .collection('contacts')
          .doc(userId)
          .set({
            image: currentUser.photoURL || 'https://via.placeholder.com/50',
            email: currentUser.email,
          });

        setNewContact('');
        setShowAddContact(false);
      } else {
        alert('User not found');
      }
    } catch (error) {
      console.error('Error adding contact: ', error);
    }
  };

  const handleEnterPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  // Select a contact and clear notifications
  const selectContact = (contact) => {
    setSelectedContact(contact);
    setMessages([]); // Clear messages when switching contacts

    // Mark contact as read and clear the notification
    setContacts(prevContacts =>
      prevContacts.map(c =>
        c.id === contact.id ? { ...c, hasNewMessage: false } : c
      )
    );
  };

  // Close a chat and remove from sidebar
  const handleRemoveContact = async (contactId) => {
    await firestore
      .collection('users')
      .doc(userId)
      .collection('contacts')
      .doc(contactId)
      .delete();

    if (selectedContact && selectedContact.id === contactId) {
      setSelectedContact(null);
      setMessages([]);
    }
  };

  const currentContact = selectedContact || { name: 'No Contact Selected', image: 'https://via.placeholder.com/50' };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h3>Contacts</h3>
          <button style={styles.addButton} onClick={() => setShowAddContact(true)}>+</button>
        </div>
        <div style={styles.contactList}>
          {contacts.map(contact => (
            <div 
              key={contact.id} 
              style={{
                ...styles.contactItem, 
                backgroundColor: contact.hasNewMessage ? '#FFD700' : (selectedContact?.id === contact.id ? '#B22222' : 'transparent')
              }}
              onClick={() => selectContact(contact)}
            >
              <img src={contact.image} alt={contact.email} style={styles.profilePicture} />
              {contact.email}
              {contact.hasNewMessage && <span style={styles.notificationDot}>●</span>}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveContact(contact.id);
                }}
                style={styles.removeButton}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.chatContainer}>
        <div style={styles.chatHeader}>
          <img src={currentContact.image} alt={currentContact.email} style={styles.headerProfilePicture} />
          <h3 style={styles.headerText}>{currentContact.email}</h3>
          <div>
            <button onClick={() => navigate(-1)} style={styles.backButton}>←</button>
          </div>
        </div>

        <div ref={chatWindowRef} style={styles.chatWindow}>
          {messages.map((msg, index) => (
            <div 
              key={index} 
              style={{
                display: 'flex',
                justifyContent: msg.sender === userId ? 'flex-end' : 'flex-start',
                margin: '10px 0'
              }}
            >
              <div style={msg.sender === userId ? styles.messageSent : styles.messageReceived}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div style={styles.inputArea}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleEnterPress}
            style={styles.input}
            placeholder="Type your message..."
          />
          <button onClick={handleSendMessage} style={styles.sendButton}>Send</button>
        </div>
      </div>

      {/* Modal for adding a new contact */}
      {showAddContact && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>Add New Contact</h3>
            <input 
              type="text" 
              value={newContact} 
              onChange={(e) => setNewContact(e.target.value)} 
              placeholder="Email of new contact"
              style={styles.modalInput} 
            />
            <button onClick={handleAddContact} style={styles.modalAddButton}>Add</button>
            <button onClick={() => setShowAddContact(false)} style={styles.modalCloseButton}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '90vh',
    width: '90vw',
    margin: '0 auto',
    border: '1px solid #ccc',
  },
  sidebar: {
    width: '25%',
    borderRight: '1px solid #ccc',
    padding: '10px',
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '5px 10px',
  },
  contactList: {
    marginTop: '10px',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    borderRadius: '4px',
    cursor: 'pointer',
    position: 'relative',
  },
  profilePicture: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    marginRight: '10px',
  },
  notificationDot: {
    color: 'red',
    marginLeft: '5px',
  },
  removeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    marginLeft: '15px',
  },
  chatContainer: {
    flexGrow: 1,
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  headerProfilePicture: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    marginRight: '10px',
  },
  headerText: {
    flexGrow: 1,
  },
  backButton: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '5px 10px',
  },
  chatWindow: {
    flexGrow: 1,
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '10px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  messageSent: {
    backgroundColor: '#007bff',
    borderRadius: '15px',
    padding: '10px',
    maxWidth: '60%',
    alignSelf: 'flex-end',
  },
  messageReceived: {
    backgroundColor: '#E9E9E9',
    borderRadius: '15px',
    padding: '10px',
    maxWidth: '60%',
    alignSelf: 'flex-start',
  },
  inputArea: {
    display: 'flex',
    marginTop: '10px',
  },
  input: {
    flexGrow: 1,
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  sendButton: {
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 15px',
    marginLeft: '5px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  modalInput: {
    marginBottom: '10px',
    padding: '10px',
    width: '100%',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  modalAddButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '5px 10px',
  },
  modalCloseButton: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '5px 10px',
  },
};

export default Chat;