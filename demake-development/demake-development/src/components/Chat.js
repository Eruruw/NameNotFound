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
      .orderBy('timestamp', 'desc');
	  .limit(10);

    const unsubscribe = messagesRef.onSnapshot(snapshot => {
      const loadedMessages = snapshot.docs.map(doc => doc.data().reverse());
      setMessages(loadedMessages);
    });

      // Update the last message time
      if (loadedMessages.length > 0) {
        const lastMessage = loadedMessages[loadedMessages.length - 1];
        setLastMessageTime(lastMessage.timestamp.toDate().toLocaleString());
      }
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
	setLastMessageTime('');

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
      setLastMessageTime('');
    }
  };	

  const currentContact = selectedContact || { name: 'No Contact Selected', image: 'https://via.placeholder.com/50' };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h3 style={styles.sidebarHeaderText}>My Contacts</h3>
          <button style={styles.addButton} onClick={() => setShowAddContact(true)}>+</button>
        </div>
        <div style={styles.contactList}>
          {contacts.map(contact => (
            <div 
              key={contact.id} 
              style={{
                ...styles.contactItem, 
                backgroundColor: selectedContact?.id === contact.id ? '#ffffff' : 'transparent'
              }}
              onClick={() => selectContact(contact)}
            >
              <img src={contact.image} alt={contact.email} style={styles.profilePicture} />
              <div style={styles.contactText}>
                <p style={styles.contactName}>{contact.email}</p>
                <p style={styles.contactPreview}>Last message preview...</p>
              </div>
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
          <div style={styles.headerInfo}>
            <h3 style={styles.headerText}>{currentContact.email}</h3>
            <p style={styles.matchInfo}>Last message: {lastMessageTime}</p>
          </div>
          <button onClick={() => navigate(-1)} style={styles.backButton}>←</button>
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
            placeholder="Type a message"
          />
          <button onClick={handleSendMessage} style={styles.sendButton}>Send</button>
        </div>
      </div>

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
	position: 'absolute',
	top: 0,
	left: 0,
    display: 'flex',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#ffffff',
  },
  sidebar: {
    width: '25%',
    backgroundColor: '#ebebeb',
    display: 'flex',
    flexDirection: 'column',
    padding: '10px',
  },
  sidebarHeader: {
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#b19cd9',
    borderRadius: '10px',
    color: '#fff',
  },
  sidebarHeaderText: {
    margin: 0,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#b19cd9',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    padding: '5px 10px',
    cursor: 'pointer',
  },
  contactList: {
    overflowY: 'auto',
    flexGrow: 1,
    padding: '10px 0',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '5px',
  },
  profilePicture: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    marginRight: '10px',
  },
  contactText: {
    flexGrow: 1,
  },
  contactName: {
    fontWeight: 'bold',
    margin: 0,
  },
  contactPreview: {
    fontSize: '0.8em',
    color: '#888',
    margin: 0,
  },
  notificationDot: {
    color: '#ff5252',
    fontSize: '1.2em',
    marginLeft: '5px',
  },
  removeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#888',
    marginLeft: '10px',
    cursor: 'pointer',
  },
  chatContainer: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#b19cd9',
    color: '#fff',
    borderRadius: '0 0 0 0',
  },
  headerProfilePicture: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    marginRight: '10px',
  },
  headerInfo: {
    flexGrow: 1,
  },
  headerText: {
    fontSize: '1.2em',
    fontWeight: 'bold',
    margin: 0,
  },
  matchInfo: {
    fontSize: '0.8em',
    color: '#fff',
  },
  backButton: {
    backgroundColor: '#b19cd9',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    padding: '5px 10px',
    cursor: 'pointer',
  },
  chatWindow: {
    flexGrow: 1,
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    backgroundColor: '#fff',
  },
  messageSent: {
    backgroundColor: '#9ca6d9',
    color: 'white',
    borderRadius: '15px',
    padding: '10px',
    maxWidth: '60%',
  },
  messageReceived: {
    backgroundColor: '#d09cd9',
    color: '#333',
    borderRadius: '15px',
    padding: '10px',
    maxWidth: '60%',
  },
  inputArea: {
    display: 'flex',
    padding: '10px',
    backgroundColor: '#fff',
  },
  input: {
    flexGrow: 1,
    padding: '10px',
    borderRadius: '20px',
    border: 'none',
  },
  sendButton: {
    backgroundColor: '#b19cd9',
    color: 'white',
    border: 'none',
    borderRadius: '40%',
    padding: '10px 15px',
    cursor: 'pointer',
    marginLeft: '5px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
  },
  modalInput: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    width: '80%',
    marginBottom: '10px',
  },
  modalAddButton: {
    backgroundColor: '#fd5068',
    color: '#fff',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  modalCloseButton: {
    backgroundColor: '#ddd',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    marginLeft: '10px',
    cursor: 'pointer',
  },
};

export default Chat;