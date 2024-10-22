import React, { useState, useEffect } from 'react';
import { firestore, auth } from '../firebase'; // importing Firestore and auth from firestore.js

const Chat = () => {
  const [user, setUser] = useState(null); // Store the authenticated user
  const [message, setMessage] = useState(''); // The current message input
  const [messages, setMessages] = useState([]); // Array to store messages

  // Listen for Firebase auth state changes to set user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser); // Set the user when authenticated
      } else {
        setUser(null); // User is logged out
      }
    });

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, []);

  // Fetch messages from Firestore when the component mounts
  useEffect(() => {
    const unsubscribe = firestore.collection('messages')
      .orderBy('timestamp', 'asc') // Get messages in order of when they were sent
      .onSnapshot((snapshot) => {
        const fetchedMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(fetchedMessages); // Set the fetched messages
      });

    return () => unsubscribe(); // Clean up Firestore listener
  }, []);

  // Handle sending a message
  const handleSendMessage = () => {
    if (message.trim() === '') return; // Don't send empty messages

    if (!user) {
      alert('Please log in to send messages.');
      return;
    }

    // New message object, including sender's user ID
    const newMessage = {
      text: message,
      timestamp: new Date().toISOString(),
      sender: user.uid, // Set the authenticated user's ID as the sender
    };

    // Add the message to Firestore
    firestore.collection('messages').add(newMessage)
      .then(() => {
        setMessage(''); // Clear the input after sending
      })
      .catch((error) => {
        console.error('Error sending message: ', error);
      });
  };

  // Render the chat window with messages
  return (
    <div className="chat-container">
      {/* Chat window */}
      <div className="chat-window" id="chat-window">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender === user?.uid ? 'sent' : 'received'}`}>
            {msg.text}
          </div>
        ))}
      </div>

      {/* Message input and send button */}
      <div className="input-area">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
