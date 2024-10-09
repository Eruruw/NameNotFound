import React, { useState, useEffect } from 'react';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';

const Profile = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Option1');
  const [category, setCategory] = useState('Choice1');

  // Load data from localStorage on component mount
  useEffect(() => {
    loadImageAndText();
    loadDropdowns();
  }, []);

  // Function to load image and text from localStorage
  const loadImageAndText = () => {
    const savedImage = localStorage.getItem('item_uploadedImage');
    const savedText = localStorage.getItem('item_savedText');

    if (savedImage) {
      setImageSrc(savedImage);
    }

    if (savedText) {
      setName(savedText);
    }
  };

  // Function to load dropdown selections from localStorage
  const loadDropdowns = () => {
    const savedDropdown1 = localStorage.getItem('item_dropdown1Selection');
    const savedDropdown2 = localStorage.getItem('item_dropdown2Selection');

    if (savedDropdown1) {
      setLocation(savedDropdown1);
    }

    if (savedDropdown2) {
      setCategory(savedDropdown2);
    }
  };

  // Function to handle image upload and save to localStorage
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target.result);
        localStorage.setItem('item_uploadedImage', e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file.');
    }
  };

  // Function to handle name input and save to localStorage
  const handleSaveDescription = () => {
    localStorage.setItem('item_savedText', name);
    alert('Text saved successfully!');
  };

  // Function to handle dropdown selections and save to localStorage
  const handleSavePreferences = () => {
    localStorage.setItem('item_dropdown1Selection', location);
    localStorage.setItem('item_dropdown2Selection', category);
    alert('Dropdown selections saved successfully!');
  };

  // Function to remove image, text, and dropdown selections from localStorage
  const handleDelete = () => {
    localStorage.removeItem('item_uploadedImage');
    setImageSrc(null);

    localStorage.removeItem('item_savedText');
    setName('');

    localStorage.removeItem('item_dropdown1Selection');
    setLocation('Option1');

    localStorage.removeItem('item_dropdown2Selection');
    setCategory('Choice1');
  };

  const goToItem = () => {
    window.location.href = '/item'; // Replace with proper routing if needed
  };

  const goToUserInfo = () => {
    window.location.href = '/'; // Replace with proper routing if needed
  };

  return (
    <Container 
      fluid 
      style={{ 
        //backgroundColor: 'aquamarine',
        minHeight: '100vh',
        padding: '0', // Remove padding for full width
        margin: '0', // Remove margin for full width
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

          {/* Image element to display the uploaded image */}
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
            Save Description
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

          {/* Profile button positioned in the top-right corner */}
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
        </Form>
      </div>
    </Container>
  );
};


export default Profile;