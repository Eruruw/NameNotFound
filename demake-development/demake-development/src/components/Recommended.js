import React, { useState, useEffect } from 'react';
import { Card, Button } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Recommended() {
    const [recommendedItems, setRecommendedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();
    const db = getFirestore();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecommendedItems = async () => {
            if (!currentUser) return;

            try {
                // Step 1: Get liked item IDs from userLikes collection for the current user
                const likesRef = collection(db, "userLikes");
                const likedItemsSnapshot = await getDocs(query(likesRef, where("userId", "==", currentUser.uid)));
                const likedItemIds = likedItemsSnapshot.docs.map(doc => doc.data().itemId);

                // Step 2: Fetch all items and filter out liked ones
                const itemsRef = collection(db, "items");
                const allItemsSnapshot = await getDocs(itemsRef);
                const allItems = allItemsSnapshot.docs
                    .filter(doc => !likedItemIds.includes(doc.id))
                    .map(doc => ({ id: doc.id, ...doc.data() }));

                // Step 3: Fetch profile names for each item's sellerId
                const itemsWithProfiles = await Promise.all(
                    allItems.map(async item => {
                        const sellerId = item.sellerId;
                        let sellerName = "Unknown Seller";

                        // Check if sellerId exists and fetch the name
                        if (sellerId) {
                            try {
                                const profileRef = doc(db, "profiles", sellerId);
                                const profileSnapshot = await getDoc(profileRef);
                                if (profileSnapshot.exists()) {
                                    sellerName = profileSnapshot.data().name;
                                }
                            } catch (profileError) {
                                console.warn(`Error fetching profile for sellerId ${sellerId}:`, profileError);
                            }
                        }
                        
                        return { ...item, sellerName };
                    })
                );

                setRecommendedItems(itemsWithProfiles.slice(0, 10)); // Limit to 10 items for performance
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
                            <h5>{item.sellerName}</h5>
                            <p>{item.description || "No Description Available"}</p>
                            <strong>Price:</strong> ${item.price || "N/A"}
                        </Card.Body>
                    </Card>
                ))
            ) : (
                <p>No recommendations available at this time.</p>
            )}
            <Button variant="primary" onClick={() => navigate("/swipe")}>Back to Swiping</Button>
        </div>
    );
}
