import React, { useEffect, useState } from 'react';
import { firestore } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

function Cart() {
    const { currentUser } = useAuth();
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const fetchCartItems = async () => {
            if (!currentUser) {
                console.warn("No user is logged in.");
                return;
            }

            try {
                const userLikesRef = firestore.collection('userLikes');
                const likedItemsSnapshot = await userLikesRef
                    .where("userId", "==", currentUser.uid)
                    .get();

                if (likedItemsSnapshot.empty) {
                    setCartItems([]);
                    return;
                }

                const itemIds = likedItemsSnapshot.docs.map(doc => doc.data().itemId);
                const itemsRef = firestore.collection('items');
                const itemsSnapshot = await itemsRef.where("__name__", "in", itemIds).get();
                const items = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                setCartItems(items);
            } 
            catch (error) {
                console.error("Error fetching cart items:", error);
            }
        };

        fetchCartItems();
    }, [currentUser]);

    const removeItem = async (itemId) => {
        try {
            const userLikesRef = firestore.collection('userLikes');
            const snapshot = await userLikesRef
                .where("userId", "==", currentUser.uid)
                .where("itemId", "==", itemId)
                .get();

            snapshot.forEach(doc => doc.ref.delete());
            setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
        } 
        catch (error) {
            console.error("Error removing item from cart:", error);
        }
    };

    const removeAllItems = async () => {
        try {
            const userLikesRef = firestore.collection('userLikes');
            const snapshot = await userLikesRef.where("userId", "==", currentUser.uid).get();

            const batch = firestore.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();

            setCartItems([]);
        } 
        catch (error) {
            console.error("Error clearing cart:", error);
        }
    };

    const proceedToCheckout = () => {
        if (cartItems.length === 0) {
            alert("Your cart is empty. Please add items before proceeding to checkout.");
            return;
        }
        window.location.href = '/checkout';
    };

    const styles = {
        container: { backgroundColor: '#9c84c5', color: 'White', textAlign: 'center', minHeight: '100vh', padding: '20px', textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'},
        cartItems: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px', maxHeight: '300px', overflowY: 'auto', paddingRight: '10px'},
        cartItem: { borderRadius: '10px', padding: '10px', marginBottom: '15px', textAlign: 'center', width: '300px'},
        image: { maxWidth: '100%', maxHeight: '150px', borderRadius: '10px', marginBottom: '10px' },
        deleteButton: { backgroundColor: '#d9534f', color: 'white', border: 'none', padding: '10px 20px', margin: '10px', cursor: 'pointer', fontSize: '16px', borderRadius: '5px', textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000'},
        actionButton: { backgroundColor: '#9932cc', color: 'white', border: 'none', padding: '10px 20px', margin: '10px', cursor: 'pointer', fontSize: '16px', borderRadius: '5px', textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000'}
    };

    return (
        <div style={styles.container}>
            <h1>Your Cart</h1>
            <div style={styles.cartItems}>
                {cartItems.length === 0 ? (
                    <p>Your cart is empty.</p>
                ) : (
                    cartItems.map((item) => (
                        <div style={styles.cartItem} key={item.id}>
                            {item.images && item.images[0] && (
                                <img src={item.images[0]} alt="Item" style={styles.image} />
                            )}
                            <p>{item.description}</p>
                            <p><strong>Price:</strong> ${item.price}</p>
                            <button style={styles.deleteButton} onClick={() => removeItem(item.id)}>Delete Item</button>
                        </div>
                    ))
                )}
            </div>
            <button style={styles.actionButton} onClick={proceedToCheckout}>Proceed to Checkout</button>
            <button style={styles.actionButton} onClick={removeAllItems}>Remove All Items</button>
            <button style={styles.actionButton} onClick={() => window.location.href = '/transactions'}>View Transactions</button>
            <button style={styles.actionButton} onClick={() => window.location.href = '/swipe'}>Return to App</button>
        </div>
    );
}

export default Cart;