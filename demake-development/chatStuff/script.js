// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Get references to DOM elements
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const chatWindow = document.getElementById('chat-window');

    // Load messages from localStorage on page load
    loadMessages();

    // Define a constant for the maximum character limit
    const MAX_MESSAGE_LENGTH = 200;
    const userId = window.location.pathname.includes('user2.html') ? 'user2' : 'user1'; // Determine the user

    // Function to send a message
    function sendMessage() {
        const messageText = chatInput.value;

        if (messageText.length > MAX_MESSAGE_LENGTH) {
            alert(`Message is too long! Maximum length is ${MAX_MESSAGE_LENGTH} characters.`);
            return;
        }

        if (messageText.trim() !== '') {
            const message = {
                text: messageText,
                timestamp: new Date().toISOString(),
                sender: userId // Identify the sender
            };

            saveMessage(message);
            displayMessage(message);
            chatWindow.scrollTop = chatWindow.scrollHeight;
            chatInput.value = '';
        }
    }

    function saveMessage(message) {
        const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
        messages.push(message);

        if (messages.length > 200) {
            messages.shift();
        }

        localStorage.setItem('chatMessages', JSON.stringify(messages));
    }

	function loadMessages() {
		chatWindow.innerHTML = '';
		try {
			const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];

			const fragment = document.createDocumentFragment();

			messages.forEach(message => {
				const newMessage = document.createElement('div');
				newMessage.classList.add('message', message.sender === userId ? 'received' : 'sent');
				newMessage.textContent = message.text;
				fragment.appendChild(newMessage);
			});

			chatWindow.appendChild(fragment);
			chatWindow.scrollTop = chatWindow.scrollHeight;
		} catch (error) {
			console.error('Failed to load messages:', error);
		}
	}


    function displayMessage(message) {
        const newMessage = document.createElement('div');
        newMessage.classList.add('message', message.sender === userId ? 'received' : 'sent');
        newMessage.textContent = message.text;
        chatWindow.appendChild(newMessage);
    }

    const clearButton = document.getElementById('clear-button');
    clearButton.addEventListener('click', clearMessages);

    function clearMessages() {
        localStorage.removeItem('chatMessages');
        chatWindow.innerHTML = '';
    }

    sendButton.addEventListener('click', sendMessage);

    chatInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function refreshMessages() {
        loadMessages(); 
    }

    setInterval(refreshMessages, 5000);
});
