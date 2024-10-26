import React, { useState } from 'react';
import { Form, Container, Row, Col, Button } from 'react-bootstrap';

// Define the Item component
const Match = () => {
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  // Functions to handle navigation
  const goToSwipeScreen = () => {
    window.location.href = '/swipe';
  };

  const goToChat = () => {
    window.location.href = '/chat1';
  };

  return (
    <Container>
      <h1>Component Loaded</h1> {/* Visible title to ensure the component is rendering */}

      <h1>YOU SWIPED ON THE RIGHT DEAL</h1>
      <Row className="mb-3">
        <Col>
          <Form.Group controlId="formTitle">
            <Form.Control
              type="text"
              placeholder="Choose one of the following!"
            />
          </Form.Group>
        </Col>
      </Row>

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

      {/* Profile button */}
      <Button variant="secondary" onClick={goToSwipeScreen} className="mt-4">
        Continue swiping
      </Button>

      {/* Chat button */}
      <Button variant="secondary" onClick={goToChat} className="mt-4 ml-2">
        Chat
      </Button>
    </Container>
  );
};

export default Match;