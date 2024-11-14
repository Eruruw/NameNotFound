import React, { useState, useEffect } from 'react';
import { firestore } from "../firebase";
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Container } from 'react-bootstrap';

const Match = () => {
  const { currentUser } = useAuth();
  const [likedUsers, setLikedUsers] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});
  const [visibleLikes, setVisibleLikes] = useState(5);
  const [hasMoreLikes, setHasMoreLikes] = useState(true);

  useEffect(() => {
    const fetchLikedUsers = async () => {
      if (currentUser) {
        try {
          const likesSnapshot = await firestore
            .collection('userLikes')
            .where('sellerId', '==', currentUser.uid)
            .get();

          const likedUsersList = likesSnapshot.docs.map(doc => ({
            userId: doc.data().userId,
            itemId: doc.data().itemId,
            likedAt: doc.data().likedAt.toDate(),
          }));

          const groupedLikes = likedUsersList.reduce((acc, current) => {
            const existing = acc[current.userId];
            if (!existing || current.likedAt > existing.likedAt) {
              acc[current.userId] = current;
            }
            return acc;
          }, {});

          const mostRecentLikes = Object.values(groupedLikes);
          setLikedUsers(mostRecentLikes);

          const userIds = Array.from(new Set(mostRecentLikes.map(item => item.userId)));

          const profiles = {};
          for (let id of userIds) {
            const userDoc = await firestore.collection('profiles').doc(id).get();
            if (userDoc.exists) {
              profiles[id] = {
                name: userDoc.data().name || 'Unknown User',
                image: userDoc.data().image || null,
              };
            }
          }

          setUserProfiles(profiles);

          if (mostRecentLikes.length <= visibleLikes) {
            setHasMoreLikes(false);
          }
        } catch (error) {
          console.error("Error fetching liked users:", error);
        }
      }
    };

    fetchLikedUsers();
  }, [currentUser, visibleLikes]);

  const loadMoreLikes = () => {
    setVisibleLikes(prev => prev + 5);
  };

  return (
    <Container style={styles.matchContainer}>
      <h1 style={styles.appTitle}>Matches</h1>

      <div style={styles.likedUsersContainer}>
        {likedUsers.length > 0 ? (
          likedUsers.slice(0, visibleLikes).map(user => (
            <Card key={user.userId} style={styles.userCard}>
              {userProfiles[user.userId]?.image ? (
                <Card.Img
                  src={userProfiles[user.userId].image}
                  alt={`${userProfiles[user.userId].name}'s profile`}
                  style={styles.profilePic}
                />
              ) : (
                <div style={styles.placeholderPic}>No Image</div>
              )}
              <Card.Body>
                <Card.Title style={styles.userName}>
                  {userProfiles[user.userId]?.name || "Unknown User"}
                </Card.Title>
                <Card.Text style={styles.likedAt}>
                  Liked At: {user.likedAt.toLocaleString()}
                </Card.Text>
              </Card.Body>
            </Card>
          ))
        ) : (
          <p>No users have liked your items yet.</p>
        )}
      </div>

      {hasMoreLikes && (
        <Button variant="secondary" onClick={loadMoreLikes} style={styles.loadMoreBtn}>
          Load More
        </Button>
      )}

      <div style={styles.navigationButtons}>
        <Button variant="primary" onClick={() => window.location.href = '/swipe'} style={styles.navBtn}>
          Continue Swiping
        </Button>
        <Button variant="success" onClick={() => window.location.href = '/chat'} style={styles.navBtn}>
          Chat
        </Button>
      </div>
    </Container>
  );
};

const styles = {
  matchContainer: {
    background: 'linear-gradient(135deg, #ff6e7f, #bfe9ff)',
    color: '#333',
    paddingTop: '50px',
    minHeight: '100vh',
    textAlign: 'center',
  },
  appTitle: {
    fontSize: '2.2rem',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  likedUsersContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '10px',
  },
  userCard: {
    width: '120px', // Smaller card width
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
    textAlign: 'center',
  },
  profilePic: {
    width: '100%',
    height: '100px', // Smaller height
    objectFit: 'cover',
    borderRadius: '8px 8px 0 0',
  },
  placeholderPic: {
    width: '100%',
    height: '100px',
    backgroundColor: '#ccc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    color: '#555',
  },
  userName: {
    fontSize: '1rem',
  },
  likedAt: {
    fontSize: '0.8rem',
    color: '#666',
  },
  loadMoreBtn: {
    marginTop: '20px',
  },
  navigationButtons: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '30px',
  },
  navBtn: {
    width: '45%',
    padding: '10px',
    fontSize: '1.1rem',
    borderRadius: '50px',
  },
};

export default Match;
