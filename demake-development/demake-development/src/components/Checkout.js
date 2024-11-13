import React, { useEffect, useState } from 'react';
import { firestore } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Checkout() {
    const { currentUser } = useAuth();
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

    const handlePaymentMethod = async (method) => {
        const transactionId = `TRANSACTION-${Math.floor(Math.random() * 100000)}`;

        try {
            await firestore.collection('users').doc(currentUser.uid).collection('transactions').doc(transactionId).set({
                transactionId,
                paymentInfo: { method },
                itemDetails
            });

            const userLikesSnapshot = await firestore.collection('userLikes')
                .where("userId", "==", currentUser.uid)
                .get();

            const batch = firestore.batch();
            userLikesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();

            if (method === 'Venmo') {
                window.open('https://venmo.com/', '_blank');
            } else if (method === 'PayPal') {
                window.open('https://www.paypal.com/', '_blank');
            }

            navigate('/thankyou');
        } 
        
        catch (error) {
            console.error(`Error saving ${method} payment method or clearing cart:`, error);
        }
    };

    const styles = {
        container: {backgroundColor: '#9c84c5', color: 'white', textAlign: 'center', minHeight: '100vh', padding: '20px', textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'},
        button: {backgroundColor: '#9932cc', color: 'white', border: 'none', padding: '10px 20px', margin: '10px', cursor: 'pointer', fontSize: '16px', borderRadius: '5px', textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'}
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