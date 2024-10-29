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
                // Step 1: Get liked items from userLikes collection for the current user
                const likesRef = collection(db, "userLikes");
                const likedItemsSnapshot = await getDocs(query(likesRef, where("userId", "==", currentUser.uid)));
                
                // Get array of liked item IDs
                const likedItemIds = likedItemsSnapshot.docs.map(doc => doc.data().itemId);

                if (likedItemIds.length > 0) {
                    // Step 2: Query items collection based on liked item IDs or similar criteria
                    const itemsRef = collection(db, "items");
                    const recommendedQuery = query(itemsRef, where("__name__", "in", likedItemIds));
                    const recommendedSnapshot = await getDocs(recommendedQuery);

                    const items = recommendedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setRecommendedItems(items);
                } else {
                    setRecommendedItems([]); // No liked items, no recommendations
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
