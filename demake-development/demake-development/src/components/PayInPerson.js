import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

function PayInPerson() {
    const { currentUser } = useAuth();
    const [confirm, setConfirm] = useState(false);
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

    const handleConfirmation = async () => {
        if (!confirm) {
            alert('Please confirm that you will pay in person.');
            return;
        }

        const transactionId = `TRANSACTION-${Math.floor(Math.random() * 100000)}`;

        try {
            await firestore.collection('users').doc(currentUser.uid).collection('transactions').doc(transactionId).set({
                transactionId,
                paymentInfo: { method: 'Pay in Person' },
                itemDetails
            });

            const userLikesSnapshot = await firestore.collection('userLikes')
                .where("userId", "==", currentUser.uid)
                .get();

            const batch = firestore.batch();
            userLikesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();

            alert('Payment method confirmed: Pay in Person');
            navigate('/thankyou');
        } 
        
        catch (error) {
            console.error("Error saving payment method or clearing cart:", error);
        }
    };

    const styles = {
        container: {backgroundColor: '#9c84c5', color: 'white', textAlign: 'center', minHeight: '100vh', padding: '20px', textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'},
        checkbox: {margin: '20px' },
        button: {backgroundColor: '#9932cc', color: 'white', border: 'none', padding: '10px 20px', margin: '10px', cursor: 'pointer', fontSize: '16px', borderRadius: '5px', textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'},
    };

    return (
        <div style={styles.container}>
            <h1>Confirm Pay in Person</h1>
            <div>
                <input 
                    type="checkbox" 
                    checked={confirm} 
                    onChange={() => setConfirm(!confirm)} 
                    style={styles.checkbox}
                />
                <label> I confirm that I will pay in person</label>
            </div>
            <button style={styles.button} onClick={handleConfirmation}>Confirm and Proceed</button>
        </div>
    );
}

export default PayInPerson;