import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

function PayInPerson() {
    const { currentUser } = useAuth();
    const [confirm, setConfirm] = useState(false);
    const navigate = useNavigate();

    const handleConfirmation = async () => {
        
        if (confirm) {

            const transactionId = `TRANSACTION-${Math.floor(Math.random()*100000)}`;

            try {
                await firestore.collection('users').doc(currentUser.uid).collection('transactions').doc(transactionId).set({
                    transactionId,
                    paymentInfo: { method: 'Pay in Person' }
                });
                alert('Payment method confirmed: Pay in Person');
                navigate('/thankyou');
            }
            
            catch (error) {
                console.error("Error saving payment method: ", error);
            }
        }
        
        else {
            alert('Please confirm that you will pay in person.');
        }
    };

    const styles = {
        container: {backgroundColor: 'black', color: 'white', textAlign: 'center', minHeight: '100vh', padding: '20px',},
        checkbox: {margin: '20px'},
        button: { backgroundColor: '#1877F2', color: 'white', border: 'none', padding: '10px 20px', margin: '10px', cursor: 'pointer', fontSize: '16px', borderRadius: '5px'},
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