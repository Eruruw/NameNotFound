import React from 'react';
import { firestore } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Checkout() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handlePaymentMethod = async (method) => {
        
        const transactionId = `TRANSACTION-${Math.floor(Math.random()*100000)}`;

        try {
            await firestore.collection('users').doc(currentUser.uid).collection('transactions').doc(transactionId).set({
                transactionId,
                paymentInfo: { method }
            });

            alert(`Payment method selected: ${method}`);
            if (method === 'Venmo') {
                window.location.href = 'https://venmo.com/';
            }
            
            else if (method === 'PayPal') {
                window.location.href = 'https://www.paypal.com/';
            }
            
            else {
                navigate('/thankyou');
            }
        }
        
        catch (error) {
            console.error(`Error saving ${method} payment method:`, error);
        }
    };

    const styles = {
        container: {backgroundColor: 'black', color: 'white', textAlign: 'center', minHeight: '100vh', padding: '20px'},
        button: {backgroundColor: '#1877F2', color: 'white', border: 'none', padding: '10px 20px', margin: '10px', cursor: 'pointer', fontSize: '16px', borderRadius: '5px'},
    };

    return (
        <div style={styles.container}>
            <h1>Payment Page</h1>
            <div>
                <button style={styles.button} onClick={() => navigate('/cardPayment')}>Pay with Card</button>
                <button style={styles.button} onClick={() => handlePaymentMethod('Venmo')}>Pay with Venmo</button>
                <button style={styles.button} onClick={() => handlePaymentMethod('PayPal')}>Pay with PayPal</button>
                <button style={styles.button} onClick={() => navigate('/payInPerson')}>Pay in Person</button>
            </div>
            <button style={styles.button} onClick={() => navigate('/swipe')}>Return to App</button>
        </div>
    );
}

export default Checkout;