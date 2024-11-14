import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';

const Help = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I assist you today?', sender: 'AI' },
  ]);
  const [loading, setLoading] = useState(false); // New loading state

  const chatWindowRef = useRef(null);

  // Initialize Google Generative AI with the API key
  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const AI_PROMPT = "You are an AI assistant designed to help users with questions about the website. You are the website's support. The website is like a mix of Tinder and Facebook Marketplace, where users can swipe on items and chat with other users to buy their items. Prices can either be decided upon by communication between users or by paying a certain price outright decided by the seller. Matching does not work entirely the same as in Tinder, as only one user needs to swipe to show interest in an item, then the seller is notified that someone is interested. Items that are matched in the swiping process are saved in a cart, where they can either be paid immediately or returned to later after talking with the seller. Items can either be bought through payment processing online or bought in person depending on the seller. Geolocation and interests are saved in a user's profile to find nearby and related items to help find better possible matches. Typical social media functions like profile creation are included. Here is the user's question:"; // Starting prompt

  const handleSendMessage = async () => {
    if (message.trim() === '' || loading) return; // Prevent sending if loading

    // Create the full message with the prompt
    const fullMessage = AI_PROMPT + message;
    
    // Add user's message to chat and reset input
    const newMessage = { text: message, sender: 'You' }; // Only user input is shown in chat
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setMessage('');
    setLoading(true); // Set loading to true while waiting for AI response

    // Generate AI response
    try {
      const result = await model.generateContent(fullMessage); // Send full message with prompt
      const aiMessage = { text: result.response.text(), sender: 'AI' };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage = { text: 'Sorry, there was an error. Please try again.', sender: 'AI' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false); // Reset loading to false after AI response
    }
  };

  const handleEnterPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div style={styles.container}>
      {/* Header with back button */}
      <div style={styles.chatHeader}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>←</button>
        <h3 style={styles.headerText}>AI Assistant</h3>
      </div>

      {/* Chat window */}
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
          disabled={loading} // Disable input when loading
        />
        <button onClick={handleSendMessage} style={styles.sendButton} disabled={loading}>
          {loading ? 'Waiting...' : 'Send'} {/* Show loading text */}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column', // Add this line to make the layout vertical
    height: '100vh',
    width: '100vw',
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
  backButton: {
    backgroundColor: '#b19cd9',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    padding: '5px 10px',
    cursor: 'pointer',
  },
  headerText: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
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
};

export default Help;