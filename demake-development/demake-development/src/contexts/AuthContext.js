import React, { useContext, useState, useEffect } from 'react';
import { auth, firestore } from '../firebase'; // Add firestore import

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState();
    const [loading, setLoading] = useState(true);

    // Function to initialize user data in Firestore
    async function createUserData(user) {
        try {
            // Check if the user document already exists
            const userDoc = firestore.collection('users').doc(user.uid);
            const docSnapshot = await userDoc.get();

            if (!docSnapshot.exists) {
                // Create initial user data document if it doesn't exist
                await userDoc.set({
                    email: user.email,
                    createdAt: new Date(),
                    items: [] // Set default empty items array or any initial data
                });
            }
        } catch (error) {
            console.error("Error creating user data:", error);
        }
    }

    async function signup(email, password) {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await createUserData(userCredential.user); // Create Firestore document on signup
        return userCredential;
    }

    function login(email, password) {
        return auth.signInWithEmailAndPassword(email, password);
    }

    function logout() {
        return auth.signOut();
    }

    function resetPassword(email) {
        return auth.sendPasswordResetEmail(email);
    }

    function updateEmail(email) {
        return currentUser.updateEmail(email);
    }

    function updatePassword(password) {
        return currentUser.updatePassword(password);
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            setCurrentUser(user);
            if (user) await createUserData(user); // Initialize Firestore data if it doesn’t exist
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        login,
        signup,
        logout,
        resetPassword,
        updateEmail,
        updatePassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}