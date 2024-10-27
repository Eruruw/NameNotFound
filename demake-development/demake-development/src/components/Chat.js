import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { text: 'Hello!', sender: 'User1' },
    { text: 'Hi there!', sender: 'User2' },
  ]);
  const [contacts, setContacts] = useState([
    { name: 'User1', image: 'https://via.placeholder.com/50' },
    { name: 'User2', image: 'https://via.placeholder.com/50' },
    { name: 'User3', image: 'https://via.placeholder.com/50' },
    { name: 'User4', image: 'https://via.placeholder.com/50' },
    { name: 'User5', image: 'https://via.placeholder.com/50' },
    { name: 'User6', image: 'https://via.placeholder.com/50' },
  ]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState('');
  
  // Create a ref for the chat window
  const chatWindowRef = useRef(null);

  const handleSendMessage = () => {
    if (message.trim() === '') return;

    const newMessage = { text: message, sender: 'You' };
    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const handleEnterPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const handleAddContact = () => {
    if (newContact.trim() && !contacts.some(contact => contact.name === newContact)) {
      setContacts([...contacts, { name: newContact, image: 'https://via.placeholder.com/50' }]);
      setNewContact('');
      setShowAddContact(false);
    }
  };

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]); // Dependency array includes messages

  // Assuming you want to show the profile of the first contact as the current user being chatted with
  const currentContact = contacts[0];

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h3>Contacts</h3>
          <button style={styles.addButton} onClick={() => setShowAddContact(true)}>+</button>
        </div>
        <div style={styles.contactList}>
          {contacts.map((contact, index) => (
            <div key={index} style={styles.contactItem}>
              <img src={contact.image} alt={contact.name} style={styles.profilePicture} />
              {contact.name}
            </div>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div style={styles.chatContainer}>
        {/* Header */}
        <div style={styles.chatHeader}>
          <img src={currentContact.image} alt={currentContact.name} style={styles.headerProfilePicture} />
          <h3 style={styles.headerText}>{currentContact.name}</h3>
          <button onClick={() => navigate(-1)} style={styles.backButton}>←</button>
        </div>

        <div ref={chatWindowRef} style={styles.chatWindow}>
          {messages.map((msg, index) => (
            <div 
              key={index} 
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'You' ? 'flex-end' : 'flex-start',
                margin: '10px 0'
              }}
            >
              <div style={msg.sender === 'You' ? styles.messageSent : styles.messageReceived}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
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

      {showAddContact && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h4>Add Contact</h4>
            <input
              type="text"
              value={newContact}
              onChange={(e) => setNewContact(e.target.value)}
              placeholder="Enter name..."
              style={styles.modalInput}
            />
            <button onClick={handleAddContact} style={styles.modalButton}>Add</button>
            <button onClick={() => setShowAddContact(false)} style={styles.modalButton}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles for desktop layout
const styles = {
  container: {
    display: 'flex',
    height: '95vh',
    width: '98vw',
    backgroundColor: '#f4f4f9',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  },
  sidebar: {
    width: '25%',
    backgroundColor: '#8B0000',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '8px 0 0 8px',
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px',
    fontSize: '18px',
    borderBottom: '1px solid #ccc',
  },
  addButton: {
    backgroundColor: 'white',
    color: '#8B0000',
    border: 'none',
    padding: '0px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  contactList: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px',
    fontSize: '22px',
    cursor: 'pointer',
    borderBottom: '1px solid #ccc',
  },
  profilePicture: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    marginRight: '10px',
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    width: '75%',
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #ccc',
  },
  headerProfilePicture: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    marginRight: '10px',
  },
  headerText: {
    flex: 1,
    fontSize: '32px',
  },
  backButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '33px',
    marginLeft: '18px',
  },
  chatWindow: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    backgroundColor: '#fff',
    borderBottom: '1px solid #ccc',
    maxWidth: '100%',
    wordWrap: 'break-word',
  },
  messageSent: {
    backgroundColor: '#d1e7dd',
    alignSelf: 'flex-end',
    padding: '10px',
    borderRadius: '10px',
    margin: '10px 0',
    width: 'fit-content',
    maxWidth: '70%',
    textAlign: 'left',
    whiteSpace: 'normal',
    overflowWrap: 'break-word',
  },
  messageReceived: {
    backgroundColor: '#9ee37d',
    alignSelf: 'flex-start',
    padding: '10px',
    borderRadius: '10px',
    margin: '10px 0',
    width: 'fit-content',
    maxWidth: '70%',
    textAlign: 'left',
    whiteSpace: 'normal',
    overflowWrap: 'break-word',
  },
  inputArea: {
    display: 'flex',
    padding: '10px',
    backgroundColor: '#f9f9f9',
  },
  input: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    marginRight: '10px',
  },
  sendButton: {
    padding: '10px 20px',
    border: 'none',
    backgroundColor: '#8B0000',
    color: 'white',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '5px',
    textAlign: 'center',
  },
  modalInput: {
    padding: '10px',
    margin: '10px 0',
    width: '80%',
    border: '1px solid #ccc',
    borderRadius: '5px',
  },
  modalButton: {
    padding: '10px 15px',
    border: 'none',
    margin: '5px',
    backgroundColor: '#8B0000',
    color: 'white',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default Chat;
