import React from 'react';
import { Container, Button, Row, Col } from 'react-bootstrap';

const Match = () => {
  // Navigation functions
  const goToSwipeScreen = () => {
    window.location.href = '/swipe';
  };

  const goToChat = () => {
    window.location.href = '/chat1';
  };

  return (
    <Container className="text-center mt-5">
      <h1>That's a Swipe Right on the Right Deal!</h1>
      <p>Choose your next step:</p>
      <Row className="justify-content-center mt-4">
        <Col xs="auto">
          <Button variant="primary" onClick={goToSwipeScreen}>
            Continue Swiping
          </Button>
        </Col>
        <Col xs="auto">
          <Button variant="success" onClick={goToChat}>
            Chat
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Match;