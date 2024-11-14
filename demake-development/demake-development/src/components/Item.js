import React, { useState, useEffect } from 'react';
import { Button, Form, Container, Card, Carousel } from 'react-bootstrap';
import { firestore, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const Item = () => {
  const { currentUser } = useAuth();
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [itemType, setItemType] = useState('');

  useEffect(() => {
    if (currentUser) {
      firestore.collection('items').doc(currentUser.uid).get().then(doc => {
        if (doc.exists) {
          const data = doc.data();
          setImages(data.images || []);
          setDescription(data.description || '');
          setPrice(data.price || '');
          setItemType(data.itemId || '');
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
        sellerId: currentUser.uid,
        itemId: itemType,
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
        sellerId: currentUser.uid,
        itemId: itemType,
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
      setItemType('');
    }
  };

  const goToProfile = () => {
    window.location.href = '/profile';
  };

  const goToChat = () => {
    window.location.href = '/chat';
  };

  const goToMatchScreen = () => {
    window.location.href = '/match';
  };

  const goToSwipeScreen = () => {
    window.location.href = '/swipe';
  };

  return (
    <Container className="mt-4 mb-4" style={{ maxWidth: '600px' }}>
      <h2 className="text-center mb-4">Edit Item</h2>

      {/* Image Upload Section */}
      <Card className="mb-3 p-3" style={{ borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <Form.Group controlId="formFile">
          <Form.Label>Upload Images</Form.Label>
          <Form.Control type="file" accept="image/*" multiple onChange={handleImageUpload} />
        </Form.Group>

        {images.length > 0 && (
          <Carousel className="mt-3">
            {images.map((imageSrc, index) => (
              <Carousel.Item key={index}>
                <img src={imageSrc} alt={`Uploaded ${index + 1}`} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
              </Carousel.Item>
            ))}
          </Carousel>
        )}
      </Card>

      {/* Description Section */}
      <Card className="mb-3 p-3" style={{ borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <Form.Group controlId="formDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Describe your item..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>
      </Card>

      {/* Price Section */}
      <Card className="mb-3 p-3" style={{ borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <Form.Group controlId="formPrice">
          <Form.Label>Price</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </Form.Group>
      </Card>

      {/* Item Type Section */}
      <Card className="mb-3 p-3" style={{ borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <Form.Group controlId="formItemType">
          <Form.Label>Item Type</Form.Label>
          <Form.Control as="select" value={itemType} onChange={(e) => setItemType(e.target.value)}>
            <option value="">Select a category</option>
            <option value="electronics">Electronics</option>
            <option value="physical_goods">Clothing</option>
          </Form.Control>
        </Form.Group>
      </Card>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between mt-3">
        <Button variant="primary" onClick={handleSaveDescription}>
          Save Changes
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          Delete Item
        </Button>
      </div>
      {/* Navigation Buttons */}
      <Button variant="secondary" style={{ position: 'absolute', top: '20px', right: '20px' }} onClick={goToProfile}>
        Profile
      </Button>
      <Button variant="secondary" style={{ position: 'absolute', top: '20px', left: '20px' }} onClick={goToChat}>
        Chat
      </Button>
      <Button variant="secondary" style={{ position: 'absolute', top: '80px', left: '20px' }} onClick={goToMatchScreen}>
        Match
      </Button>
      <Button variant="secondary" style={{ position: 'absolute', top: '20px', right: '160px' }} onClick={goToSwipeScreen}>
        Swiping
      </Button>
    </Container>
  );
};

export default Item;

//test