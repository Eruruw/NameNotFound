import React, { useState, useEffect } from 'react';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';

const Item = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [description, setDescription] = useState('');

  // Function to load image and text from localStorage when the component mounts
  useEffect(() => {
    const savedImage = localStorage.getItem('profile_uploadedImage');
    const savedText = localStorage.getItem('profile_savedText');

    if (savedImage) {
      setImageSrc(savedImage); // Set the saved image as the image source
    }

    if (savedText) {
      setDescription(savedText); // Set the saved text in the text box
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to handle image upload and save it to localStorage
  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();

      reader.onload = (e) => {
        setImageSrc(e.target.result); // Display the image
        localStorage.setItem('profile_uploadedImage', e.target.result); // Save image to localStorage
      };

      reader.readAsDataURL(file); // Read file as Data URL
    } else {
      alert('Please select a valid image file.');
    }
  };

  // Function to handle text input and save it to localStorage
  const handleSaveDescription = () => {
    localStorage.setItem('profile_savedText', description); // Save text to localStorage
    alert('Text saved successfully!');
  };

  // Function to remove image and text from localStorage
  const handleDelete = () => {
    localStorage.removeItem('profile_uploadedImage'); // Remove image from localStorage
    setImageSrc(''); // Clear the image display

    localStorage.removeItem('profile_savedText'); // Remove text from localStorage
    setDescription(''); // Clear the text box
  };

  const goToProfile = () => {
    window.location.href = '/profile'; // Replace with proper routing if needed
  };

  const goToChat = () => {
    window.location.href = '/chat1'; // Replace with proper routing if needed
  };

  return (
    <Container>
      <h1>Selling Section</h1>
      <Row className="mb-3">
        <Col>
          <Form.Group controlId="formFile">
            <Form.Label>Upload Image</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
          </Form.Group>
        </Col>
      </Row>

      {/* Image element to display the uploaded image */}
      {imageSrc ? (
        <img src={imageSrc} style={{ maxWidth: '400px', maxHeight: '400px', borderRadius: '10px' }} alt="Uploaded" />
      ) : (
        <p>No image uploaded yet.</p>
      )}

      <h1 className="mt-4">Describe Your Item</h1>
      {/* Text box for input */}
      <Form.Group controlId="formDescription">
        <Form.Control
          type="text"
          placeholder="Enter your description here"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Form.Group>

      {/* Button to save the text */}
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
      {/* Profile button positioned in the top-right corner */}
      <Button
        variant="secondary"
        style={{ position: 'absolute', top: '20px', left: '20px' }}
        onClick={goToChat}
      >
        Chat
      </Button>
    </Container>
  );
};

export default Item;
