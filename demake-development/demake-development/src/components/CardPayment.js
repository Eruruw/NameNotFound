import React, { useState } from 'react';
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
    const navigate = useNavigate();

    const SECRET_KEY = 'secret-key'; 

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!name || !cardNumber || !expiry || !cvv) {
            alert("Please fill out all fields.");
            return;
        }
    
        const transactionId = `TRANSACTION-${Math.floor(Math.random()*100000)}`;
    
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
                }
            });
    
            alert(`Payment submitted successfully! Transaction ID: ${transactionId}`);
            navigate('/thankyou');
        }
        
        catch (error) {
            console.error("Error saving encrypted card information: ", error);
        }
    };
    

    const styles = {
        container: {backgroundColor: 'black', color: 'white', textAlign: 'center', minHeight: '100vh', padding: '20px'},
        input: {display: 'block', width: '80%', margin: '10px auto', padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc'},
        button: {backgroundColor: '#1877F2', color: 'white', border: 'none', padding: '10px 20px', margin: '10px', cursor: 'pointer', fontSize: '16px', borderRadius: '5px'},
    };

    return (
        <div style={styles.container}>
            <h1>Card Payment</h1>
            <form onSubmit={handleSubmit}>
                <input style={styles.input} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Cardholder Name" required />
                <input style={styles.input} type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="Card Number" required />
                <input style={styles.input} type="text" value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="Expiry (MM/YY)" required />
                <input style={styles.input} type="text" value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="CVV" required />
                <button style={styles.button} type="submit">Submit Payment</button>
            </form>
            <button style={styles.button} onClick={() => navigate('/swipe')}>Return to App</button>
        </div>
    );
}

export default CardPayment;