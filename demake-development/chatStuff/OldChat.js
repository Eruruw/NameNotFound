import React, { useState, useEffect } from 'react';
import './Chat.css'; // Import CSS file for styles

const Chat = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    // Load messages from localStorage when the component mounts
    useEffect(() => {
        const storedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
        setMessages(storedMessages);
    }, []);

    // Save messages to localStorage whenever the messages array changes
    useEffect(() => {
        localStorage.setItem('chatMessages', JSON.stringify(messages));
    }, [messages]);

    const handleSendMessage = () => {
        if (message.trim() === '') return;

        const newMessage = {
            text: message,
            timestamp: new Date().toISOString(),
            sender: 'user2', // Set sender based on your application logic
        };

        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setMessage(''); // Clear input after sending
    };

    const handleClearMessages = () => {
        localStorage.removeItem('chatMessages');
        setMessages([]);
    };

    const goToItem = () => {
        window.location.href = '/item'; // Replace with proper routing if needed
      };

    const goToChat2 = () => {
    window.location.href = '/chat2'; // Replace with proper routing if needed
    };

    return (
        <div className="chat-container">
            <div className="header">
                <img src="profile-placeholder.jpg" alt="User Profile" />
                <h3>User 1</h3>
            </div>
            <div className="chat-window" id="chat-window">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender === 'user2' ? 'sent' : 'received'}`}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="input-container">
                <input
                    type="text"
                    id="chat-input"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button id="send-button" onClick={handleSendMessage}>Send</button>
            </div>
            <button id="clear-button" onClick={handleClearMessages}>Clear Chat Log</button>
            <button
                variant="secondary"
                style={{ position: 'absolute', top: '20px', left: '20px' }}
                onClick={goToItem}
            >
                Item
            </button> 
            <button
                variant="secondary"
                style={{ position: 'absolute', top: '20px', right: '20px' }}
                onClick={goToChat2}
            >
                Chat 2
            </button> 
        </div>
    );
};

export default Chat;
