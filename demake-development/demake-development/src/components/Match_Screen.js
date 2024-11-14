import React, { useState, useEffect } from 'react';
import { firestore } from "../firebase";
import { useAuth } from '../contexts/AuthContext';
import { Container, Button, Row, Col } from 'react-bootstrap';

const Match = () => {
  const { currentUser } = useAuth();
  const [likedUsers, setLikedUsers] = useState([]);
  const [userNames, setUserNames] = useState({}); // To store names of users who liked the item
  const [visibleLikes, setVisibleLikes] = useState(5); // Initially show 5 likes
  const [hasMoreLikes, setHasMoreLikes] = useState(true); // To check if there are more likes to load

  useEffect(() => {
    const fetchLikedUsers = async () => {
      if (currentUser) {
        try {
          const likesSnapshot = await firestore
            .collection('userLikes')
            .where('sellerId', '==', currentUser.uid) // Fetch likes where current user is the seller
            .get();

          // Map likes into an array
          const likedUsersList = likesSnapshot.docs.map(doc => ({
            userId: doc.data().userId,
            itemId: doc.data().itemId,
            likedAt: doc.data().likedAt.toDate(), // Convert Firestore timestamp to Date
          }));

          // Group likes by userId and keep the most recent like per user
          const groupedLikes = likedUsersList.reduce((acc, current) => {
            const existing = acc[current.userId];
            if (!existing || current.likedAt > existing.likedAt) {
              acc[current.userId] = current;
            }
            return acc;
          }, {});

          // Convert groupedLikes object back to an array
          const mostRecentLikes = Object.values(groupedLikes);

          setLikedUsers(mostRecentLikes);

          // Get unique user IDs who liked the current user's items
          const userIds = Array.from(new Set(mostRecentLikes.map(item => item.userId)));

          // Fetch the names of users who liked the current user's items
          const userNames = {};
          for (let id of userIds) {
            const userDoc = await firestore.collection('profiles').doc(id).get();
            if (userDoc.exists) {
              userNames[id] = userDoc.data().name || 'Unknown User';
            }
          }

          setUserNames(userNames);

          // Check if there are more likes to load
          if (mostRecentLikes.length <= visibleLikes) {
            setHasMoreLikes(false); // No more likes to load
          }
        } catch (error) {
          console.error("Error fetching liked users:", error);
        }
      }
    };

    fetchLikedUsers();
  }, [currentUser, visibleLikes]);

  // Load more likes
  const loadMoreLikes = () => {
    setVisibleLikes(prev => prev + 5); // Show 5 more likes
  };

  // Navigation functions
  const goToSwipeScreen = () => {
    window.location.href = '/swipe';
  };

  const goToChat = () => {
    window.location.href = '/chat';
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

      <h2 className="mt-5">Users Who Liked Your Items</h2>
      {likedUsers.length > 0 ? (
        <ul>
          {likedUsers.slice(0, visibleLikes).map(user => (
            <li key={user.userId}>
              <strong>{userNames[user.userId]}</strong> - Liked At: {user.likedAt.toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>No users have liked your items yet.</p>
      )}

      {hasMoreLikes && (
        <Row className="justify-content-center mt-4">
          <Col xs="auto">
            <Button variant="secondary" onClick={loadMoreLikes}>
              Load More
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Match;
//test