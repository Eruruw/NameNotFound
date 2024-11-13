import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import CryptoJS from 'crypto-js';

function CardPayment() {
    const { currentUser } = useAuth();
    const [name, setName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [itemDetails, setItemDetails] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCartItems = async () => {
            if (currentUser) {
                const userLikesSnapshot = await firestore.collection('userLikes')
                    .where("userId", "==", currentUser.uid)
                    .get();
                const itemIds = userLikesSnapshot.docs.map(doc => doc.data().itemId);

                const itemsSnapshot = await firestore.collection('items')
                    .where("__name__", "in", itemIds)
                    .get();
                const items = itemsSnapshot.docs.map(doc => ({
                    name: doc.data().description,
                    price: doc.data().price
                }));
                setItemDetails(items);
            }
        };
        fetchCartItems();
    }, [currentUser]);

    const SECRET_KEY = 'secret-key';

    const handleSubmit = async () => {
        if (!name || !cardNumber || !expiry || !cvv) {
            alert("Please fill out all fields.");
            return;
        }

        const transactionId = `TRANSACTION-${Math.floor(Math.random() * 100000)}`;
        const encryptedCardNumber = CryptoJS.AES.encrypt(cardNumber, SECRET_KEY).toString();
        const encryptedExpiry = CryptoJS.AES.encrypt(expiry, SECRET_KEY).toString();
        const encryptedCvv = CryptoJS.AES.encrypt(cvv, SECRET_KEY).toString();

        try {
            await firestore.collection('users').doc(currentUser.uid).collection('transactions').doc(transactionId).set({
                transactionId,
                paymentInfo: {
                    method: 'Card',
                    details: {
                        name,
                        cardNumber: encryptedCardNumber,
                        expiry: encryptedExpiry,
                        cvv: encryptedCvv
                    }
                },
                itemDetails
            });

            // Send transaction email
            await sendEmail(currentUser.email, transactionId, { method: 'Card', itemDetails });

            alert(`Payment submitted successfully! Transaction ID: ${transactionId}`);
            navigate('/thankyou');
        } 
        
        catch (error) {
            console.error("Error saving transaction or clearing cart:", error);
        }
    };

    const sendEmail = async (email, transactionId, transactionDetails) => {
        const apiKey = 'fcd06da028fe5720d4e480ce0c380133-79295dd0-dc031cbc';
        const domain = 'sandboxbe341ba925a0422c8c6ae13eba1b2bd4.mailgun.org';
        const mailgunUrl = `https://api.mailgun.net/v3/${domain}/messages`;

        const formData = new URLSearchParams();
        formData.append('from', 'swipefordeals@gmail.com'); // Use a verified Mailgun email
        formData.append('to', email);
        formData.append('subject', `Transaction Confirmation: ${transactionId}`);
        formData.append('text', `Hello,\n\nHere are the details of your transaction:\n\n${JSON.stringify(transactionDetails, null, 2)}\n\nThank you!`);

        try {
            const response = await fetch(mailgunUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${btoa(`api:${apiKey}`)}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            if (response.ok) {
                console.log('Email sent successfully.');
            } else {
                console.error('Failed to send email:', response.statusText);
            }
        } 
        
        catch (error) {
            console.error('Error sending email:', error);
        }
    };

    const styles = {
        container: {backgroundColor: '#9c84c5', color: 'white', textAlign: 'center', minHeight: '100vh', padding: '20px', textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'},
        input: {display: 'block', width: '80%', margin: '10px auto', padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' },
        button: {backgroundColor: '#9932cc', color: 'white', border: 'none', padding: '10px 20px', margin: '10px', cursor: 'pointer', fontSize: '16px', borderRadius: '5px', textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'}
    };

    return (
        <div style={styles.container}>
            <h1>Card Payment</h1>
            <div>
                <input style={styles.input} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Cardholder Name" required />
                <input style={styles.input} type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="Card Number" required />
                <input style={styles.input} type="text" value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="Expiry (MM/YY)" required />
                <input style={styles.input} type="text" value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="CVV" required />
                <button style={styles.button} onClick={handleSubmit}>Submit Payment</button>
            </div>
            <button style={styles.button} onClick={() => navigate('/swipe')}>Return to App</button>
        </div>
    );
}

export default CardPayment;