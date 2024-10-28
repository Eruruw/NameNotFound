import React, { useState, useEffect } from 'react';
import { firestore } from "../firebase";  // Import Firestore
import cartIcon from '../assets/cartIcon.jpg';  // Importing the cart icon

const SwipeForItems = () => {
  const [items, setItems] = useState([]); // Stores items fetched from Firestore
  const [index, setIndex] = useState(0);
  const [cart, setCart] = useState([]);
  
  const goToProfile = () => {
    window.location.href = '/profile';
  };

  // Fetch items from Firestore on component mount
  useEffect(() => {
    const fetchItems = async () => {
      const itemsCollection = await firestore.collection('items').get();
      const itemsList = itemsCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(itemsList);
    };
    
    fetchItems();
  }, []);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(savedCart);
  }, []);

  // Update localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const currentItem = items[index]; // Get the current item to display

  const handleLike = () => {
    if (currentItem && !cart.some(item => item.id === currentItem.id)) {
      setCart([...cart, currentItem]);
    }
    setIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const handleDislike = () => {
    setIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  if (items.length === 0) {
    return <p>Loading items...</p>;  // Show loading message while items are being fetched
  }

  return (
    <div style={styles.body}>
      <div style={styles.profileButtonContainer}>
        <button onClick={goToProfile} style={styles.profileButton}>Profile</button>
      </div>
      <div style={styles.card}>
        {/* Display the current item image if it exists, otherwise show a placeholder */}
        {currentItem?.images?.[0] ? (
          <img src={currentItem.images[0]} alt="Item to buy" style={styles.image} />
        ) : (
          <p style={styles.description}>Image not available</p>
        )}
        <p style={styles.description}>{currentItem?.description}</p>
        <p style={styles.price}>${currentItem?.price}</p>
      </div>
      <div style={styles.controls}>
        <button onClick={handleDislike} style={styles.button}>Dislike (Swipe Left)</button>
        <button onClick={handleLike} style={styles.button}>Like (Swipe Right)</button>
      </div>
      {/* Cart Icon */}
      <a href="cart.html">
        <img src={cartIcon} alt="Cart" style={styles.cartIcon} />
      </a>
    </div>
  );
};

const styles = {
  body: {
    fontFamily: 'Arial, sans-serif',
    margin: '20px',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    flexDirection: 'column',
  },
  card: {
    width: '300px',
    padding: '20px',
    margin: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    position: 'relative',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: '10px',
  },
  description: {
    color: 'black',
    marginTop: '10px',
  },
  price: {
    color: 'limegreen',
    fontSize: '1.2em',
    marginTop: '5px',
  },
  controls: {
    textAlign: 'center',
    marginTop: '20px',
    position: 'absolute',
    bottom: '0',
  },
  button: {
    padding: '10px 20px',
    margin: '5px',
    fontSize: '16px',
  },
  cartIcon: {
    position: 'absolute',
    top: '100px',
    right: '500px',
    width: '50px',
  },
  profileButtonContainer: {
    position: 'absolute',
    top: '20px',
    right: '20px',
  },
  profileButton: {
    padding: '10px, 15px',
    fontSize: '16px',
    backgroundColor: 'blue',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default SwipeForItems;