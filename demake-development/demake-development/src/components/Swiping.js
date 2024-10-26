import React, { useState, useEffect } from 'react';

// Import images and cart icon
import image1 from '../assets/image1.jpg';
import image2 from '../assets/image2.jpg';
import image3 from '../assets/image3.jpg';
import image4 from '../assets/image4.jpg';
import image5 from '../assets/image5.jpg';
import cartIcon from '../assets/cartIcon.jpg';  // Importing the cart icon

const imagePaths = [image1, image2, image3, image4, image5];

const SwipeForItems = () => {
  const [index, setIndex] = useState(0);
  const [cart, setCart] = useState([]);
  const goToProfile = () => {
    window.location.href = '/profile'
  }

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(savedCart);
  }, []);

  // Update localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const getImage = () => {
    return imagePaths[index];
  };

  const handleLike = () => {
    const currentItem = imagePaths[index];
    if (!cart.includes(currentItem)) {
      setCart([...cart, currentItem]);
    }
    setIndex((prevIndex) => (prevIndex + 1) % imagePaths.length);
  };

  const handleDislike = () => {
    setIndex((prevIndex) => (prevIndex + 1) % imagePaths.length);
  };


  return (
    <div style={styles.body}>
      <div style={styles.profileButtonContainer}>
        <button onClick={goToProfile} style={styles.profileButton}>Profile</button>
      </div>
      <div style={styles.card}>
        <img id="itemImage" src={getImage()} alt="Item to buy" style={styles.image} />
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
    backgroundColor: 'black',
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
    curser: 'pointer',
  },

};

export default SwipeForItems;