import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '10px',
    marginTop: '20px'
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
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
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
        <Container
            fluid
            style={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f7f7f7',
                padding: '20px',
                overflowY: 'auto', // Enables scrolling if content exceeds height
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    backgroundColor: '#fff',
                    borderRadius: '20px',
                    padding: '20px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center',
                    maxHeight: '80vh', // Limits the maximum height of the content
                    overflowY: 'auto', // Enables scrolling within the container
                }}
            >
                <h2 style={{ color: '#ff5864', marginBottom: '20px' }}>User Dashboard</h2>
                
                {error && <Alert variant='danger'>{error}</Alert>}

                <Card.Body>
                    <strong>Email:</strong> {currentUser.email}
                    
                    <Link to="/update-profile" className="btn btn-primary w-100 mt-3" style={{
                        backgroundColor: '#ff5864',
                        border: 'none',
                        borderRadius: '30px'
                    }}>
                        Update Profile
                    </Link>

                    {/* Displaying the street address */}
                    {address ? (
                        <p style={{ marginTop: '20px' }}>Current Address: {address}</p>
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

                    <Button
                        variant="primary"
                        onClick={getUserLocation}
                        className="mt-3"
                        style={{
                            backgroundColor: '#ff5864',
                            border: 'none',
                            borderRadius: '30px',
                            width: '100%',
                            marginTop: '20px'
                        }}
                    >
                        Update Location
                    </Button>
                </Card.Body>
                
                <div className="w-100 text-center mt-4">
                    <Link
                        to="/item"
                        style={{
                            display: 'inline-block',
                            padding: '10px 20px',
                            backgroundColor: '#ff5864',
                            color: '#fff',
                            borderRadius: '50px',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 10px rgba(255, 88, 100, 0.3)',
                            transition: '0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#ff7384';
                            e.target.style.boxShadow = '0 4px 12px rgba(255, 88, 100, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#ff5864';
                            e.target.style.boxShadow = '0 4px 10px rgba(255, 88, 100, 0.3)';
                        }}
                    >
                        Items
                    </Link>
                </div>

                <div className="w-100 text-center mt-4">
                    <Link
                        to="/profile"
                        style={{
                            display: 'inline-block',
                            padding: '10px 20px',
                            backgroundColor: '#4a90e2',
                            color: '#fff',
                            borderRadius: '50px',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 10px rgba(74, 144, 226, 0.3)',
                            transition: '0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#73a9ff';
                            e.target.style.boxShadow = '0 4px 12px rgba(74, 144, 226, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#4a90e2';
                            e.target.style.boxShadow = '0 4px 10px rgba(74, 144, 226, 0.3)';
                        }}
                    >
                        Go to Profile
                    </Link>
                </div>

                <div className="w-100 text-center mt-2">
                    <Button variant="link" onClick={handleLogout} style={{ color: '#ff5864' }}>
                        Log Out
                    </Button>
                </div>
            </div>
        </Container>
    );
}
