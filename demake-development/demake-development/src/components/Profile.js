import React, { useState, useEffect } from 'react';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';
import { firestore, storage } from "../firebase";
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { currentUser } = useAuth();
  const [imageSrc, setImageSrc] = useState(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Option1');
  const [category, setCategory] = useState('Choice1');

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    const doc = await firestore.collection('profiles').doc(currentUser.uid).get();
    if (doc.exists) {
      const data = doc.data();
      setImageSrc(data.image || null);
      setName(data.name || '');
      setLocation(data.location || 'Option1');
      setCategory(data.category || 'Choice1');
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const storageRef = storage.ref(`profilePictures/${currentUser.uid}/${file.name}`);
      await storageRef.put(file);
      const url = await storageRef.getDownloadURL();

      setImageSrc(url);
      await firestore.collection('profiles').doc(currentUser.uid).set({
        image: url
      }, { merge: true });
    } else {
      alert('Please select a valid image file.');
    }
  };

  const handleSaveDescription = async () => {
    await firestore.collection('profiles').doc(currentUser.uid).set({
      name
    }, { merge: true });
    alert('Name saved successfully!');
  };

  const handleSavePreferences = async () => {
    await firestore.collection('profiles').doc(currentUser.uid).set({
      location,
      category
    }, { merge: true });
    alert('Preferences saved successfully!');
  };

  const handleDelete = async () => {
    if (imageSrc) {
      const storageRef = storage.refFromURL(imageSrc);
      await storageRef.delete();
    }

    await firestore.collection('profiles').doc(currentUser.uid).delete();

    setImageSrc(null);
    setName('');
    setLocation('Option1');
    setCategory('Choice1');
  };

  const goToItem = () => {
    window.location.href = '/item';
  };

  const goToUserInfo = () => {
    window.location.href = '/';
  };

  const goToHelp = () => {
    window.location.href = '/help';
  };

  return (
    <Container
      fluid
      style={{
        minHeight: '100vh',
        padding: '0',
        margin: '0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <h1>Profile</h1>
        <Form>
          <Form.Group controlId="formFile">
            <Form.Label>Upload Profile Picture</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
          </Form.Group>

          {imageSrc && (
            <Row className="mb-3">
              <Col>
                <img
                  src={imageSrc}
                  alt="Uploaded"
                  style={{ maxWidth: '400px', maxHeight: '400px', borderRadius: '50%', objectFit: 'cover' }}
                />
              </Col>
            </Row>
          )}

          <Form.Group controlId="formName">
            <Form.Label>Enter Your Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your name here"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          <Button variant="primary" onClick={handleSaveDescription}>
            Save Name
          </Button>

          <h1 className="mt-4">Please select your preference of items and location</h1>

          <Form.Group controlId="formLocation">
            <Form.Label>Select Location</Form.Label>
            <Form.Control as="select" value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="Option1">Local Area</option>
              <option value="Option2">USA</option>
              <option value="Option3">World</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="formCategory">
            <Form.Label>Select Category</Form.Label>
            <Form.Control as="select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Choice1">Electronics</option>
              <option value="Choice2">Decor</option>
              <option value="Choice3">Clothing</option>
            </Form.Control>
          </Form.Group>

          <Button variant="primary" onClick={handleSavePreferences}>
            Save Preferences
          </Button>

          <h1 className="mt-4">In case you want to start over</h1>

          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>

          <Button
            variant="secondary"
            style={{ position: 'absolute', top: '20px', right: '20px' }}
            onClick={goToItem}
          >
            Your Item
          </Button>
          <Button
            variant="secondary"
            style={{ position: 'absolute', top: '80px', right: '20px' }}
            onClick={goToUserInfo}
          >
            User Information
          </Button>
          <Button
            variant="secondary"
            style={{ position: 'absolute', top: '140px', right: '20px' }}
            onClick={goToHelp}
          >
            Help
          </Button>
        </Form>
      </div>
    </Container>
  );
};

export default Profile;