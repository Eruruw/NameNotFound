import React, { useState, useEffect } from 'react';
import { firestore } from "../firebase";
import { Link } from 'react-router-dom';
import cartIcon from '../assets/cartIcon.jpg';
import { Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion'; // Import Framer Motion

const SwipeForItems = () => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [direction, setDirection] = useState(null); // Track swipe direction

  useEffect(() => {
    const fetchItems = async () => {
      if (currentUser) {
        const itemsCollection = await firestore.collection('items').get();
        const itemsList = itemsCollection.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(item => item.sellerId !== currentUser.uid);
        setItems(itemsList);
      }
    };
    fetchItems();
  }, [currentUser]);

  const currentItem = items[index];

  const handleLike = async () => {
    setDirection('right'); // Set direction to right
    if (currentItem) {
      try {
        await firestore.collection('userLikes').add({
          userId: currentUser.uid,
          sellerId: currentItem.sellerId,
          itemId: currentItem.id,
          likedAt: new Date()
        });
        console.log("Item liked and saved to Firestore.");
      } catch (error) {
        console.error("Error saving like to Firestore:", error);
      }
    }
    setIndex((prevIndex) => (prevIndex + 1) % items.length);
    setImageIndex(0);
  };

  const handleDislike = () => {
    setDirection('left'); // Set direction to left
    setIndex((prevIndex) => (prevIndex + 1) % items.length);
    setImageIndex(0);
  };

  const swipeVariants = {
    enter: (direction) => ({
      x: direction === 'left' ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction === 'left' ? -1000 : 1000,
      opacity: 0,
    }),
  };

  if (items.length === 0) {
    return <p>Loading items...</p>;
  }

  return (
    <div style={styles.body}>
      <div style={styles.profileButtonContainer}>
        <Link to="/profile">
          <Button variant="secondary" style={styles.profileButton}>Profile</Button>
        </Link>
        <Link to="/recommended">
          <Button variant="secondary" style={styles.profileButton}>Recommended For You</Button>
        </Link>
      </div>
      
      <AnimatePresence custom={direction}>
        <motion.div
          key={currentItem?.id}
          custom={direction}
          variants={swipeVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5 }}
          style={styles.card}
        >
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
            <Button onClick={() => setImageIndex((prevIndex) => (prevIndex - 1 + currentItem.images.length) % currentItem.images.length)} disabled={currentItem?.images?.length <= 1}>Previous</Button>
            <Button onClick={() => setImageIndex((prevIndex) => (prevIndex + 1) % currentItem.images.length)} disabled={currentItem?.images?.length <= 1}>Next</Button>
          </div>
        </motion.div>
      </AnimatePresence>
      
      <div style={styles.controls}>
        <Button onClick={handleDislike} variant="outline-danger" style={styles.button}>
          Dislike (Swipe Left)
        </Button>
        <Button onClick={handleLike} variant="outline-primary" style={styles.button}>
          Like (Swipe Right)
        </Button>
      </div>
      
      <a href="/cart">
        <img src={cartIcon} alt="Cart" style={styles.cartIcon} />
      </a>
    </div>
  );
};


// Define your styles here...
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
    marginTop: '10px',
  },
  imageControls: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '10px',
  },
};

export default SwipeForItems;
