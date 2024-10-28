import React, { useState, useEffect } from 'react';
import { firestore } from "../firebase";  // Import Firestore
import { Link } from 'react-router-dom';  // Import Link for routing
import cartIcon from '../assets/cartIcon.jpg';  // Importing the cart icon
import { Button } from 'react-bootstrap'; // Import Button from React Bootstrap

const SwipeForItems = () => {
  const [items, setItems] = useState([]); // Stores items fetched from Firestore
  const [index, setIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [cart, setCart] = useState([]);
  const [lastAction, setLastAction] = useState(null); // Track the last action

  // Fetch items from Firestore on component mount
  useEffect(() => {
    const fetchItems = async () => {
      const itemsCollection = await firestore.collection('items').get();
      const itemsList = itemsCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Fetched items:", itemsList);  // Check if sellerId is included
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
      setLastAction({ type: 'like', item: currentItem });
    }
    setIndex((prevIndex) => (prevIndex + 1) % items.length);
    setImageIndex(0);
  };

  const handleDislike = () => {
    setLastAction({ type: 'dislike', item: currentItem });
    setIndex((prevIndex) => (prevIndex + 1) % items.length);
    setImageIndex(0);
  };

  // Undo the last action
  const handleUndo = () => {
    if (lastAction) {
      if (lastAction.type === 'like') {
        setCart(cart.filter(item => item.id !== lastAction.item.id));
      }
      setIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
      setImageIndex(0);
      setLastAction(null); // Clear the last action
    }
  };

  const nextImage = () => {
    if (currentItem?.images) {
      setImageIndex((prevIndex) => (prevIndex + 1) % currentItem.images.length);
    }
  };

  const prevImage = () => {
    if (currentItem?.images) {
      setImageIndex((prevIndex) => (prevIndex - 1 + currentItem.images.length) % currentItem.images.length);
    }
  };



  if (items.length === 0) {
    return <p>Loading items...</p>;  // Show loading message while items are being fetched
  }

  return (
    <div style={styles.body}>
      <div style={styles.profileButtonContainer}>
        <Link to="/profile">
          <Button variant="secondary" style={styles.profileButton}>Profile</Button>
        </Link>
      </div>
      <div style={styles.card}>
        {currentItem?.images?.[imageIndex] ? (
          <img src={currentItem.images[imageIndex]} alt="Item to buy" style={styles.image} />
        ) : (
          <p style={styles.description}>Image not available</p>
        )}
        <p style={styles.description}>{currentItem?.description}</p>
        <p style={styles.price}>${currentItem?.price}</p>
        <Link to={`/user/${currentItem?.sellerId}`}>
          <Button variant="success" style={styles.viewProfileButton}>View Seller Profile</Button>
        </Link>
        <div style={styles.imageControls}>
          <Button onClick={prevImage} disabled={currentItem?.images?.length <= 1}>Previous</Button>
          <Button onClick={nextImage} disabled={currentItem?.images?.length <= 1}>Next</Button>
        </div>
      </div>
      <div style={styles.controls}>
        <Button onClick={handleDislike} variant="outline-danger" style={styles.button}>
          Dislike (Swipe Left)
        </Button>
        <Button onClick={handleLike} variant="outline-primary" style={styles.button}>
          Like (Swipe Right)
        </Button>
        <Button onClick={handleUndo} variant="warning" style={styles.undoButton} disabled={!lastAction}>
          Undo
        </Button>
      </div>
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
    margin: '5px',
    fontSize: '16px',
  },
  undoButton: {
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
    padding: '10px 15px',
    fontSize: '16px',
  },
  viewProfileButton: {
    padding: '10px 15px',
    fontSize: '16px',
    marginTop: '10px', // Add margin for spacing
  },
  imageControls: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '10px',
  },
};

export default SwipeForItems;