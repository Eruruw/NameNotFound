import React, { useState, useEffect } from 'react';
import { Card, Button } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Recommended.css'; // Import CSS file for styles

export default function Recommended() {
    const [recommendedItems, setRecommendedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cities, setCities] = useState([]); // To store available cities
    const [selectedCity, setSelectedCity] = useState(""); // To store user-selected city
    const { currentUser } = useAuth();
    const db = getFirestore();
    const navigate = useNavigate();

    const apiKey = 'REACT_APP_GOOGLE_MAPS_API_KEY'; // Replace with your actual API key

    const reverseGeocode = async (latitude, longitude) => {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
        try {
            const response = await axios.get(url);
            const results = response.data.results;
            for (let result of results) {
                if (result.types.includes("locality")) {
                    return result.address_components[0].long_name; // City name
                }
            }
        } catch (error) {
            console.error("Error with reverse geocoding:", error);
        }
        return null;
    };

    const fetchCitiesFromCoordinates = async () => {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        
        const citiesSet = new Set(); // Use Set to avoid duplicate cities
    
        // Map over each user document to reverse-geocode their coordinates
        const cityPromises = snapshot.docs.map(async (doc) => {
            const data = doc.data();
            if (data.latitude && data.longitude) {
                const cityName = await reverseGeocode(data.latitude, data.longitude);
                if (cityName) {
                    citiesSet.add(cityName); // Add to Set to ensure uniqueness
                }
            }
        });
    
        // Wait for all reverse-geocode calls to complete
        await Promise.all(cityPromises);
        
        // Convert Set to Array and update the cities state
        const citiesArray = Array.from(citiesSet);
        setCities(citiesArray);
    };

    const fetchUserCity = async () => {
        if (!currentUser) return;
        const userRef = doc(db, "users", currentUser.uid);
        const userSnapshot = await getDoc(userRef);
        const userData = userSnapshot.data();
        if (userData && userData.latitude && userData.longitude) {
            const city = await reverseGeocode(userData.latitude, userData.longitude);
            if (city) {
                setSelectedCity(city); // Set the user's city as the default selection
            }
        }
    };

    useEffect(() => {
        fetchCitiesFromCoordinates();
        fetchUserCity(); // Fetch and set the user city
    }, [db, currentUser]);

    useEffect(() => {
        const fetchRecommendedItems = async () => {
            if (!currentUser) return;

            try {
                const likesRef = collection(db, "userLikes");
                const likedItemsSnapshot = await getDocs(query(likesRef, where("userId", "==", currentUser.uid)));
                const likedItemIds = likedItemsSnapshot.docs.map(doc => doc.data().itemId);

                const itemsRef = collection(db, "items");
                const allItemsSnapshot = await getDocs(itemsRef);
                const allItems = allItemsSnapshot.docs
                    .filter(doc => !likedItemIds.includes(doc.id))
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(item => 
                        !selectedCity || (item.location && item.location.city === selectedCity)
                    );

                const itemsWithProfiles = await Promise.all(
                    allItems.map(async item => {
                        const sellerId = item.sellerId;
                        let sellerName = "Unknown Seller";

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
                console.error("Error fetching recommended items:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendedItems();
    }, [currentUser, db, selectedCity]);

    return (
        <div>
            <h2>Recommended for You</h2>

            <label htmlFor="city-select">Filter by City:</label>
            <select
                id="city-select"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
            >
                <option value="">All Cities</option>
                {cities.length > 0 ? (
                    cities.map(city => (
                        <option key={city} value={city}>
                            {city}
                        </option>
                    ))
                ) : (
                    <option>No cities available</option>
                )}
            </select>

            {loading ? (
                <p>Loading recommendations...</p>
            ) : (
                <div className="scrollable-container">
                    {recommendedItems.length > 0 ? (
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
                </div>
            )}
            <Button variant="primary" onClick={() => navigate("/swipe")}>Back to Swiping</Button>
        </div>
    );
}
