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
    const loadUserData = async () => {
      if (currentUser) {
        const doc = await firestore.collection('profiles').doc(currentUser.uid).get();
        if (doc.exists) {
          const data = doc.data();
          setImageSrc(data.image || null);
          setName(data.name || '');
          setLocation(data.location || 'Option1');
          setCategory(data.category || 'Choice1');
        }
      }
    };
  
    loadUserData();
  }, [currentUser]);
  

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
        backgroundColor: '#f7f7f7'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#fff',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ color: '#ff5864', marginBottom: '20px' }}>Profile</h2>
        
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
                  style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginBottom: '20px',
                    border: '3px solid #ff5864'
                  }}
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
              style={{
                borderRadius: '10px',
                textAlign: 'center',
                marginBottom: '15px'
              }}
            />
          </Form.Group>

          <Button
            variant="primary"
            onClick={handleSaveDescription}
            style={{
              backgroundColor: '#ff5864',
              border: 'none',
              borderRadius: '30px',
              width: '100%',
              marginBottom: '20px'
            }}
          >
            Save Name
          </Button>

          <h3 className="mt-4" style={{ color: '#ff5864' }}>Preferences</h3>

          <Form.Group controlId="formLocation">
            <Form.Label>Select Location</Form.Label>
            <Form.Control
              as="select"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ borderRadius: '10px', marginBottom: '15px' }}
            >
              <option value="Option1">Local Area</option>
              <option value="Option2">USA</option>
              <option value="Option3">World</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="formCategory">
            <Form.Label>Select Category</Form.Label>
            <Form.Control
              as="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ borderRadius: '10px', marginBottom: '20px' }}
            >
              <option value="Choice1">Electronics</option>
              <option value="Choice2">Decor</option>
              <option value="Choice3">Clothing</option>
            </Form.Control>
          </Form.Group>

          <Button
            variant="primary"
            onClick={handleSavePreferences}
            style={{
              backgroundColor: '#ff5864',
              border: 'none',
              borderRadius: '30px',
              width: '100%',
              marginBottom: '20px'
            }}
          >
            Save Preferences
          </Button>

          <h3 className="mt-4" style={{ color: '#ff5864' }}>Reset Profile</h3>

          <Button
            variant="danger"
            onClick={handleDelete}
            style={{
              borderRadius: '30px',
              width: '100%',
              marginBottom: '20px'
            }}
          >
            Delete Profile
          </Button>
          
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
            <Button variant="secondary" onClick={goToItem} style={{ borderRadius: '30px' }}>Your Item</Button>
            <Button variant="secondary" onClick={goToUserInfo} style={{ borderRadius: '30px' }}>User Info</Button>
            <Button variant="secondary" onClick={goToHelp} style={{ borderRadius: '30px' }}>Help</Button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default Profile;
