import React, { useEffect, useState } from 'react';
import { firestore } from "../firebase";  // Import Firestore
import { useParams } from 'react-router-dom';

const OtherUser = () => {
  const { userId } = useParams(); // Get userId from URL
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return; // Ensure userId exists
      try {
        const userDoc = await firestore.collection('profiles').doc(userId).get(); // Ensure correct collection
        if (userDoc.exists) {
          setUserData(userDoc.data());
        } else {
          setError("User not found");
        }
      } catch (err) {
        setError("Error fetching user data.");
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return <p>Loading user data...</p>; // Loading indicator
  }

  if (error) {
    return <p>{error}</p>; // Error message if any
  }

  if (!userData) {
    return <p>User data could not be loaded.</p>; // Handle case where data is empty
  }

  return (
    <div>
      <h1>{userData.name || "No name available"}</h1>
      <p>{userData.description || "No description available"}</p>
      {/* Display other user details if available */}
    </div>
  );
};

export default OtherUser;