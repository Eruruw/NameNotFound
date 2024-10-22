import React from "react"
import Signup from "./Signup"
import { Container } from 'react-bootstrap'
import { AuthProvider } from '../contexts/AuthContext'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./Login"
import DashBoard from "./DashBoard"
import PrivateRoute from "./PrivateRoute"
import ForgotPassword from "./ForgotPassword"
import UpdateProfile from "./UpdateProfile"
import Item from "./Item"
import Profile from "./Profile"
import Chat from "./Chat"

// function ChatWrapper() {
//   const { userId } = useParams();
//   return <Chat currentUser={userId} />
// }

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
                <Route path="/signup" element={<Signup/>} />
                <Route path="/login" element={<Login/>} />
                <Route path ="/forgot-password" element={<ForgotPassword/>} />
              </Routes>
            </AuthProvider>
          </Router>
        </div>
      </Container>
  )
}

export default App;
