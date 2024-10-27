import React, { useState, useEffect } from 'react';
import { Card, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const mapContainerStyle = {
    width: '100%',
    height: '400px',
};

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
};

export default function DashBoard() {
    const [error, setError] = useState("");
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [address, setAddress] = useState("");
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const db = getFirestore();
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, // Store your API key in .env
    });

    useEffect(() => {
        getUserLocation();
    }, []);

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLatitude(latitude);
                    setLongitude(longitude);
                    saveLocationToFirebase(latitude, longitude);
                    getAddressFromCoordinates(latitude, longitude);
                },
                (error) => {
                    console.error("Error retrieving location: ", error);
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const saveLocationToFirebase = async (latitude, longitude) => {
        try {
            const userId = currentUser?.uid;
            if (userId) {
                await setDoc(doc(db, "users", userId), { latitude, longitude }, { merge: true });
                console.log("Location saved to Firebase");
            } else {
                console.error("User is not authenticated.");
            }
        } catch (error) {
            console.error("Error saving location to Firebase: ", error);
        }
    };

    const getAddressFromCoordinates = async (latitude, longitude) => {
        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status === "OK") {
                const addressComponents = data.results[0].formatted_address;
                setAddress(addressComponents);
            } else {
                console.error("Geocoding API error:", data.status);
            }
        } catch (error) {
            console.error("Error fetching address:", error);
        }
    };

    async function handleLogout() {
        setError('');

        try {
            await logout();
            navigate('/login');
        } catch {
            setError('Failed to log out');
        }
    }

    return (
        <>
            <Card>
                <Card.Body>
                    <h2 className="text-center mb-4">Profile</h2>
                    {error && <Alert variant='danger'>{error}</Alert>}
                    <strong>Email:</strong> {currentUser.email}
                    <Link to="/update-profile" className="btn btn-primary w-100 mt-3">Update Profile</Link>
                    
                    {/* Displaying the street address */}
                    {address ? (
                        <p>Current Address: {address}</p>
                    ) : (
                        <p>Retrieving address...</p>
                    )}

                    {isLoaded && latitude && longitude ? (
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={{ lat: latitude, lng: longitude }}
                            zoom={14}
                            options={mapOptions}
                        >
                            <Marker position={{ lat: latitude, lng: longitude }} />
                        </GoogleMap>
                    ) : (
                        <p>Loading map...</p>
                    )}

                    <Button variant="primary" onClick={getUserLocation} className="mt-3">
                        Update Location
                    </Button>
                </Card.Body>
            </Card>
            <div className="w-100 text-center mt-2">
                <Link to="/item">Items</Link>
            </div>
            <div className="w-100 text-center mt-2">
                <Button variant="link" onClick={handleLogout}>Log Out</Button>
            </div>
            <div className="w-100 text-center mt-2">
                <Link to="/recommended">Recommended for You</Link>
            </div>
        </>
    );
}
