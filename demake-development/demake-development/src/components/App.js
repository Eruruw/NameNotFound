import React from "react";
import Signup from "./Signup";
import { Container } from 'react-bootstrap';
import { AuthProvider } from '../contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import DashBoard from "./DashBoard";
import PrivateRoute from "./PrivateRoute";
import ForgotPassword from "./ForgotPassword";
import UpdateProfile from "./UpdateProfile";
import Item from "./Item";
import Profile from "./Profile";
import Chat from "./Chat";
import Match from "./Match_Screen";
import Swipe from "./Swiping";
import Recommended from "./Recommended";
import Help from "./Help.js";
import Cart from "./Cart.js";
import Checkout from "./Checkout";
import CardPayment from "./CardPayment";
import ThankYou from "./ThankYou";
import PayInPerson from "./PayInPerson"; // Importing PayInPerson component

function App() {
  return (
        <Container className="d-flex align-items-center justify-content-center"
          style={{ minHeight: "100vh" }}
        >
        <div className="w-100" style={{ maxWidth: '400px' }}>
          <Router>
            <AuthProvider>
              <Routes>
                <Route exact path="/" element={<PrivateRoute><DashBoard/></PrivateRoute>} />
                <Route path="/update-profile" element={<PrivateRoute><UpdateProfile/></PrivateRoute>} />
                <Route path="/item" element={<PrivateRoute><Item/></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>} />
                <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
                <Route path="/match" element={<PrivateRoute><Match /></PrivateRoute>} />
                <Route path="/swipe" element={<PrivateRoute><Swipe /></PrivateRoute>} />
                <Route path="/recommended" element={<PrivateRoute><Recommended /></PrivateRoute>} />
                <Route path="/signup" element={<Signup/>} />
                <Route path="/login" element={<Login/>} />
                <Route path="/forgot-password" element={<ForgotPassword/>} />
                <Route path="/help" element={<PrivateRoute><Help /></PrivateRoute>} />
                <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
                <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                <Route path="/cardPayment" element={<PrivateRoute><CardPayment /></PrivateRoute>} />
                <Route path="/thankyou" element={<PrivateRoute><ThankYou /></PrivateRoute>} />
                <Route path="/payInPerson" element={<PrivateRoute><PayInPerson /></PrivateRoute>} /> {/* New route */}
              </Routes>
            </AuthProvider>
          </Router>
        </div>
      </Container>
  );
}

export default App;
