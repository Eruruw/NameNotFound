import React, { useState, useEffect } from 'react';
import { Button, Form, Container, Row, Col, Carousel } from 'react-bootstrap';

const Item = () => {
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');

  // Load images and text from localStorage when the component mounts
  useEffect(() => {
    const savedImages = JSON.parse(localStorage.getItem('profile_uploadedImages'));
    const savedText = localStorage.getItem('profile_savedText');

    if (savedImages) {
      setImages(savedImages); // Set saved images
    }

    if (savedText) {
      setDescription(savedText); // Set the saved text
    }
  }, []);

  // Handle image upload and save them to localStorage
  const handleImageUpload = (event) => {
    const fileList = event.target.files;
    const imageFiles = Array.from(fileList).filter(file => file.type.startsWith('image/'));

    if (imageFiles.length) {
      const newImages = [...images];

      imageFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newImages.push(e.target.result); // Add the new image to the array
          setImages(newImages); // Update state
          localStorage.setItem('profile_uploadedImages', JSON.stringify(newImages)); // Save images to localStorage
        };
        reader.readAsDataURL(file);
      });
    } else {
      alert('Please select valid image files.');
    }
  };

  // Save the description to localStorage
  const handleSaveDescription = () => {
    localStorage.setItem('profile_savedText', description);
    alert('Text saved successfully!');
  };

  // Delete images and description from localStorage
  const handleDelete = () => {
    localStorage.removeItem('profile_uploadedImages');
    setImages([]);
    localStorage.removeItem('profile_savedText');
    setDescription('');
  };

  const goToProfile = () => {
    window.location.href = '/profile';
  };

  const goToChat = () => {
    window.location.href = '/chat1';
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

      {/* Carousel to scroll through uploaded images */}
      {images.length > 0 ? (
        <Carousel>
          {images.map((imageSrc, index) => (
            <Carousel.Item key={index}>
              <img
                src={imageSrc}
                alt={`Uploaded ${index + 1}`}
                style={{ maxWidth: '400px', maxHeight: '400px', borderRadius: '10px' }}
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

      {/* Chat button positioned in the top-left corner */}
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