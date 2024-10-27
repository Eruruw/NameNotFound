import React, { useState, useEffect } from 'react';
import { Card, Button } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

export default function Recommended() {
    const [recommendedItems, setRecommendedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();
    const db = getFirestore();

    useEffect(() => {
        const fetchRecommendedItems = async () => {
            if (!currentUser) return;
            
            try {
                const userRef = collection(db, "users");
                const userDoc = await getDocs(query(userRef, where("uid", "==", currentUser.uid)));
                const userData = userDoc.docs[0]?.data();
                
                if (userData) {
                    const itemsRef = collection(db, "items");
                    
                    // Example: Fetch items based on location proximity, using dummy criteria
                    const recommendedQuery = query(itemsRef, where("location", "==", userData.location));
                    const recommendedSnapshot = await getDocs(recommendedQuery);
                    const items = recommendedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    
                    setRecommendedItems(items);
                }
            } catch (error) {
                console.error("Error fetching recommended items: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendedItems();
    }, [currentUser, db]);

    return (
        <div>
            <h2>Recommended for You</h2>
            {loading ? (
                <p>Loading recommendations...</p>
            ) : recommendedItems.length > 0 ? (
                recommendedItems.map(item => (
                    <Card key={item.id} className="mb-3">
                        <Card.Body>
                            <h5>{item.title}</h5>
                            <p>{item.description}</p>
                            <strong>Price:</strong> ${item.price}
                        </Card.Body>
                    </Card>
                ))
            ) : (
                <p>No recommendations available at this time.</p>
            )}
        </div>
    );
}
