import React, { useEffect, useState } from 'react';
import { firestore } from "../firebase";  // Import Firestore
import { useParams } from 'react-router-dom';

const OtherUser = () => {
  const { userId } = useParams(); // Get userId from URL
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await firestore.collection('profiles').doc(userId).get(); // Make sure to query the right collection
        if (userDoc.exists) {
          setUserData(userDoc.data());
        } else {
          console.error("User not found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return <p>Loading user data...</p>; // Show loading message while user data is being fetched
  }

  if (!userData) {
    return <p>User not found.</p>; // Handle case where user data doesn't exist
  }

  return (
    <div>
      <h1>{userData.name}</h1>
      <p>{userData.description}</p>
      {/* Add more user details as needed */}
    </div>
  );
};

export default OtherUser;