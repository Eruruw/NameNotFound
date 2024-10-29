import React from 'react';
import { useNavigate } from 'react-router-dom';

function ThankYou() {
    const navigate = useNavigate();

    const styles = {
        container: { backgroundColor: 'black', color: 'white', textAlign: 'center', minHeight: '100vh', padding: '20px'},
        button: {backgroundColor: '#1877F2', color: 'white', border: 'none', padding: '10px 20px', margin: '10px', cursor: 'pointer', fontSize: '16px', borderRadius: '5px'},
    };

    return (
        <div style={styles.container}>
            <h1>Thank You for Your Purchase!</h1>
            <p>Your order was successful.</p>
            <button style={styles.button} onClick={() => navigate('/swipe')}>Return to App</button>
        </div>
    );
}

export default ThankYou;