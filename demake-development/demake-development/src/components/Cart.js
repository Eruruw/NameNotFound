import React, { useEffect, useState } from 'react';

function Cart() {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const items = JSON.parse(localStorage.getItem("cart")) || [];
        setCartItems(items);
    }, []);

    const removeItem = (index) => {
        const updatedCart = [...cartItems];
        updatedCart.splice(index, 1);
        setCartItems(updatedCart);

        localStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    const removeAllItems = () => {
        setCartItems([]);
        localStorage.removeItem("cart");
    };

    const proceedToCheckout = () => {
        if (cartItems.length === 0) {
            alert("Your cart is empty. Please add items before proceeding to checkout.");
            return;
        }
        window.location.href = '/checkout';
    };

    const styles = {
        container: { backgroundColor: 'black', color: 'white', textAlign: 'center', minHeight: '100vh', padding: '20px' },
        cartItems: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' },
        cartItem: { borderRadius: '10px', padding: '10px', marginBottom: '15px', textAlign: 'center', width: '300px'},
        deleteButton: { backgroundColor: 'red', color: 'white', border: 'none', padding: '10px 20px', margin: '10px', cursor: 'pointer', fontSize: '16px', borderRadius: '5px' },
        actionButton: { backgroundColor: '#1877F2', color: 'white', border: 'none', padding: '10px 20px', margin: '10px', cursor: 'pointer', fontSize: '16px', borderRadius: '5px' }
    };

    return (
        <div style={styles.container}>
            <h1>Your Cart</h1>
            <div style={styles.cartItems}>
                {cartItems.length === 0 ? (
                    <p>Your cart is empty.</p>
                ) : (
                    cartItems.map((item, index) => (
                        <div style={styles.cartItem} key={index}>
                            <p>{item.description}</p>
                            <p><strong>Price:</strong> ${item.price}</p>
                            <button style={styles.deleteButton} onClick={() => removeItem(index)}>Delete Item</button>
                        </div>
                    ))
                )}
            </div>
            <button style={styles.actionButton} onClick={proceedToCheckout}>Proceed to Checkout</button>
            <button style={styles.actionButton} onClick={removeAllItems}>Remove All Items</button>
            <button style={styles.actionButton} onClick={() => window.location.href = '/swipe'}>Return to App</button>
        </div>
    );
}

export default Cart;