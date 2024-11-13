import React, { useState, useEffect } from 'react';
import { firestore } from "../firebase";
import { Link } from 'react-router-dom';
import cartIcon from '../assets/cartIcon.jpg';
import { Button, Dropdown } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const SwipeForItems = () => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [direction, setDirection] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      if (currentUser) {
        const itemsCollection = await firestore.collection('items').get();
        const itemsList = itemsCollection.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(item => item.sellerId !== currentUser.uid);
        setItems(itemsList);
        setFilteredItems(itemsList);
      }
    };
    fetchItems();
  }, [currentUser]);

  useEffect(() => {
    const filtered = filter ? items.filter(item => item.itemId === filter) : items;
    setFilteredItems(filtered);
    setIndex(0);
  }, [filter, items]);

  const currentItem = filteredItems[index];

  const handleLike = async () => {
    setDirection('right');
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
    setIndex((prevIndex) => (prevIndex + 1) % filteredItems.length);
    setImageIndex(0);
  };

  const handleDislike = () => {
    setDirection('left');
    setIndex((prevIndex) => (prevIndex + 1) % filteredItems.length);
    setImageIndex(0);
  };

  const swipeVariants = {
    enter: (direction) => ({
      x: direction === 'right' ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction === 'left' ? -1000 : 1000,
      opacity: 0
    })
  };

  return (
    <div style={styles.body}>
      <div style={styles.filterContainer}>
        <Dropdown onSelect={(newFilter) => setFilter(newFilter)}>
          <Dropdown.Toggle variant="primary">
            {filter || "Filter by Category"}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item eventKey="">All</Dropdown.Item>
            <Dropdown.Item eventKey="electronics">Electronics</Dropdown.Item>
            <Dropdown.Item eventKey="physical_goods">Physical Goods</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div style={styles.profileButtonContainer}>
        <Link to="/profile">
          <Button variant="secondary" style={styles.profileButton}>Profile</Button>
        </Link>
        <Link to="/recommended">
          <Button variant="secondary" style={styles.profileButton}>Recommended For You</Button>
        </Link>
      </div>

      <div style={styles.swipeContainer}>
        {currentItem ? (
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentItem.id}
              custom={direction}
              variants={swipeVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              style={styles.card}
            >
              <img src={currentItem.images[imageIndex]} alt="Item" style={styles.image} />
              <h3>{currentItem.title}</h3>
              <p>{currentItem.description}</p>
              <p style={styles.price}>${currentItem.price}</p>
              <div style={styles.imageControls}>
                <Button onClick={() => setImageIndex((imageIndex - 1 + currentItem.images.length) % currentItem.images.length)}>Previous</Button>
                <Button onClick={() => setImageIndex((imageIndex + 1) % currentItem.images.length)}>Next</Button>
              </div>
              <div style={styles.buttonContainer}>
                <Button onClick={handleDislike} variant="outline-danger" style={styles.dislikeButton}>Dislike (Swipe Left)</Button>
                <Button onClick={handleLike} variant="outline-primary" style={styles.likeButton}>Like (Swipe Right)</Button>
              </div>
              <Link to={`/profile/${currentItem.sellerId}`}>
                <Button variant="success" style={styles.viewProfileButton}>View Seller Profile</Button>
              </Link>
            </motion.div>
          </AnimatePresence>
        ) : (
          <p>No more items available.</p>
        )}
      </div>

      <a href="/cart">
        <img src={cartIcon} alt="Cart" style={styles.cartIcon} />
      </a>
    </div>
  );
};

const styles = {
  body: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f2f2ff',
    height: '100vh',
    margin: '20px',
  },
  filterContainer: {
    marginBottom: '20px',
  },
  profileButtonContainer: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  profileButton: {
    padding: '10px 15px',
    fontSize: '16px',
    marginBottom: '10px',
  },
  swipeContainer: {
    width: '300px',
    height: '400px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: '10px',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
    padding: '20px',
    textAlign: 'center',
    backgroundColor: 'white',
  },
  image: {
    width: '100%',
    height: '60%',
    objectFit: 'cover',
    borderRadius: '10px',
  },
  price: {
    color: 'limegreen',
    fontSize: '1.2em',
    marginTop: '5px',
  },
  imageControls: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: '10px',
  },
  buttonContainer: {
    marginTop: '40px',
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  dislikeButton: {
    margin: '5px',
    fontSize: '16px',
    padding: '10px 15px',
    flex: 1,
  },
  likeButton: {
    margin: '5px',
    fontSize: '16px',
    padding: '10px 15px',
    flex: 1,
  },
  viewProfileButton: {
    padding: '10px 15px',
    fontSize: '16px',
    marginTop: '10px',
    width: '100%',
  },
  cartIcon: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '50px',
  },
};

export default SwipeForItems;
