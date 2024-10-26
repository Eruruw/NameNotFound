import React, { useState, useEffect } from 'react';
import { Button, Form, Container, Row, Col, Carousel } from 'react-bootstrap';
import { firestore, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const Item = () => {
  const { currentUser } = useAuth();
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (currentUser) {
      firestore.collection('items').doc(currentUser.uid).get().then(doc => {
        if (doc.exists) {
          const data = doc.data();
          setImages(data.images || []);
          setDescription(data.description || '');
          setPrice(data.price || '');
        }
      });
    }
  }, [currentUser]);

  const handleImageUpload = async (event) => {
    const fileList = event.target.files;
    const imageFiles = Array.from(fileList).filter(file => file.type.startsWith('image/'));

    if (imageFiles.length && currentUser) {
      const newImages = [...images];

      for (const file of imageFiles) {
        const storageRef = storage.ref(`images/${currentUser.uid}/${file.name}`);
        const snapshot = await storageRef.put(file);
        const url = await snapshot.ref.getDownloadURL();
        newImages.push(url);
      }

      setImages(newImages);
      await firestore.collection('items').doc(currentUser.uid).set({
        images: newImages,
      }, { merge: true });
    } else {
      alert('Please select valid image files.');
    }
  };

  const handleSaveDescription = async () => {
    if (currentUser) {
      await firestore.collection('items').doc(currentUser.uid).set({
        description,
        price,
      }, { merge: true });
      alert('Description and price saved successfully!');
    }
  };

  const handleDelete = async () => {
    if (currentUser) {
      for (const imageUrl of images) {
        const storageRef = storage.refFromURL(imageUrl);
        await storageRef.delete();
      }

      await firestore.collection('items').doc(currentUser.uid).delete();
      setImages([]);
      setDescription('');
      setPrice('');
    }
  };

  const goToProfile = () => {
    window.location.href = '/profile';
  };

  const goToChat = () => {
    window.location.href = '/chat1';
  };
  const goToMatchScreen = () => {
    window.location.href = '/match';
  };

  const goToSwipeScreen = () => {
    window.location.href = '/swipe';
  };
  
  return (
    <Container>
      <h1>Selling Section</h1>
      <Row className="mb-3">
        <Col>
          <Form.Group controlId="formFile">
            <Form.Label>Upload Images</Form.Label>
            <Form.Control type="file" accept="image/*" multiple onChange={handleImageUpload} />
          </Form.Group>
        </Col>
      </Row>

      {images.length > 0 ? (
        <Carousel>
          {images.map((imageSrc, index) => (
            <Carousel.Item key={index}>
              <img
                src={imageSrc}
                alt={`Uploaded ${index + 1}`}
                style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px' }}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      ) : (
        <p>No images uploaded yet.</p>
      )}

<h1 className="mt-4">Describe Your Item</h1>
      <Form.Group controlId="formDescription">
        <Form.Control
          type="text"
          placeholder="Enter your description here"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Form.Group>

      <h1 className="mt-5">What's your asking price?</h1>
      <Form.Group controlId="formPrice">
        <Form.Control
          type="text"
          placeholder="Enter your desired price here"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </Form.Group>

      {/* Button to save the text and price */}
      <Button variant="primary" onClick={handleSaveDescription}>
        Save Description
      </Button>

      <h1 className="mt-4">In Case You Want to Start Over</h1>
      {/* Delete button */}
      <Button variant="danger" onClick={handleDelete}>
        Delete
      </Button>

      {/* Profile button positioned in the top-right corner */}
      <Button
        variant="secondary"
        style={{ position: 'absolute', top: '20px', right: '20px' }}
        onClick={goToProfile}
      >
        Profile
      </Button>

      {/* Chat button positioned in the top-left corner */}
      <Button
        variant="secondary"
        style={{ position: 'absolute', top: '20px', left: '20px' }}
        onClick={goToChat}
      >
        Chat
      </Button>
        {/* match button positioned in the top-left corner */}
        <Button
        variant="secondary"
        style={{ position: 'absolute', top: '80px', left: '20px' }}
        onClick={goToMatchScreen}
      >
        Match
      </Button>

      <Button
        variant="secondary"
        style={{ position: 'absolute', top: '20px', right: '160px' }}
        onClick={goToSwipeScreen}
      >
        Swiping
      </Button>
    </Container>
  );
};

export default Item;