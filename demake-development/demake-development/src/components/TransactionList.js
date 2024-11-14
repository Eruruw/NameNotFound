import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function TransactionList() {
    const { currentUser } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTransactions = async () => {
            if (currentUser) {
                const transactionsSnapshot = await firestore
                    .collection('user')
                    .doc(currentUser.uid)
                    .collection('transactions')
                    .get();
                
                const transactionsData = transactionsSnapshot.docs.map(doc => doc.data());
                setTransactions(transactionsData);
            }
        };
        fetchTransactions();
    }, [currentUser]);

    const styles = {
        container: {backgroundColor: '#9c84c5', color: 'white', textAlign: 'center', minHeight: '100vh', padding: '20px', textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'},
        transactionsList: {maxHeight: '300px', overflowY: 'auto', paddingRight: '10px'},
        transaction: {borderRadius: '10px', padding: '10px', marginBottom: '15px', textAlign: 'center', width: '300px', backgroundColor: '#9932cc' },
        itemList: {listStyleType: 'none', padding: '0' },
        button: {backgroundColor: '#9932cc', color: 'white', border: 'none', padding: '10px 20px', margin: '10px', cursor: 'pointer', fontSize: '16px', borderRadius: '5px', textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'}
    };

    return (
        <div style={styles.container}>
            <h1>Your Transactions</h1>
            <div style={styles.transactionsList}>
                {transactions.length === 0 ? (
                    <p>No transactions found.</p>
                ) : (
                    transactions.map((transaction, index) => (
                        <div key={index} style={styles.transaction}>
                            <p><strong>Transaction ID:</strong> {transaction.transactionId}</p>
                            <p><strong>Payment Method:</strong> {transaction.paymentInfo.method}</p>
                            <p><strong>Items:</strong></p>
                            <ul style={styles.itemList}>
                                {transaction.itemDetails.map((item, idx) => (
                                    <li key={idx}>
                                        {item.name} - ${item.price}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                )}
            </div>
            <button style={styles.button} onClick={() => navigate('/cart')}>Go to Cart</button>
        </div>
    );
}

export default TransactionList;