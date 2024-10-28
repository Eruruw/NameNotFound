import React, { useEffect, useState } from 'react';
import { firestore } from "../firebase";  // Import Firestore
import { useParams } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const OtherUser = () => {
  const { sellerId } = useParams(); // Get userId from URL
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchUserData = async () => {
      if (!sellerId) {
        setError("No user ID found in URL.");
        setLoading(false);
        return;
      }

      try {
        const userDoc = await firestore.collection('profiles').doc(sellerId).get();
        console.log("Fetched user document:", userDoc.data()); // Debugging line

        if (userDoc.exists) {
          setUserData(userDoc.data());
        } else {
          setError("User not found in profiles collection.");
        }
      } catch (err) {
        setError("Error fetching user data.");
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [sellerId]);

  if (loading) {
    return <p>Loading user data...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!userData) {
    return <p>User data could not be loaded.</p>;
  }

  const goToItem = () => {
    window.location.href = '/item'
  }
  return (
    <div>
      <h1>{userData.name || "No name available"}</h1>
      <p>{userData.description || "No description available"}</p>
      <Button
            variant="secondary"
            style={{ position: 'absolute', top: '20px', right: '20px' }}
            onClick={goToItem}
          >
            Your Item
          </Button>
    </div>
  );
};

export default OtherUser;