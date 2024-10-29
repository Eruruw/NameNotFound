import React, { useEffect, useState } from 'react';
import { firestore } from "../firebase";
import { useParams } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const OtherUser = () => {
  const { sellerId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!sellerId) {
        setError("No user ID found in URL.");
        setLoading(false);
        return;
      }

      try {
        const userDoc = await firestore.collection('profiles').doc(sellerId).get();
        console.log("Fetched user document:", userDoc.data());

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


  const goToSwipe = () => {
    window.location.href = '/swipe'
  }
  return (
    <div style={{ textAlign: 'center' }}>
      {userData.image ? (
        <img
          src={userData.image}
          alt={`${userData.name}'s profile`}
          style={{ width: '150px', height: '150px', borderRadius: '50%', marginBottom: '10px' }}
        />
      ) : (
        <p>No profile image available</p>
      )}
      <h1>{userData.name || "No name available"}</h1>
      <Button
        variant="secondary"
        style={{ position: 'absolute', top: '20px', right: '20px' }}
        onClick={goToItem}
      >
        Your Item
      </Button>

      <Button
        variant="secondary"
        style={{ position: 'absolute', top: '20px', left: '20px' }}
        onClick={goToSwipe}
      >
        Swiping
      </Button>

    </div>
  );
};

export default OtherUser;