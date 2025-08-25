import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
//import useDocumentTitle from './hooks/useDocumentTitle';
import Home from './components/Home';
import logoImage from './logo.png';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import NotFound from './components/NotFound';
import AppointmentComponent from './components/AppointmentComponent';
import DoctorComp from './components/DoctorComp';
import PatientComponent from './components/PatientComponent';
import AllFiles from './components/AllFiles';
import AdminComponent from './components/AdminComponent';
import ProtectedRoute from './components/ProtectedRoute';
import { Link } from 'react-router-dom';
import './styles.css';

const Layout = ({ children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
      <Link to="/"><img src={logoImage} alt="Logo" style={{ height: '80px' , marginRight: '80px' }} /></Link>
        <nav>
          
          <Link to="/about" style={{ padding: '15px 15px 15px 15px', backgroundColor: '#4CAF50', color: 'white', textDecoration: 'none', borderRadius: '0px' }}>About</Link>
          <Link to="/contact" style={{ padding: '15px 15px 15px 15px', backgroundColor: '#4CAF50', color: 'white', textDecoration: 'none', borderRadius: '0px' }}>Contact</Link>
        </nav>
    </header>
    <main style={{ flexGrow: 1 }}>{children}</main>
    <footer>
    <div>
        <Link to="/about" style={{ color: 'lightgray', margin: '0 10px' }}>About Us</Link>
        <Link to="/privacy" style={{ color: 'lightgray', margin: '0 10px' }}>Privacy Policy</Link>
        <Link to="/terms" style={{ color: 'lightgray', margin: '0 10px' }}>Terms of Service</Link>
      <br/>
      <p>Contact us: info@greenhospitals.com | +123 456 7890</p>
        <p>Follow us:</p>
        <a href="http://facebook.com" style={{ color: 'lightblue', margin: '0 5px' }}>Facebook</a>
        <a href="http://twitter.com" style={{ color: 'skyblue', margin: '0 5px' }}>Twitter</a>
        <a href="http://instagram.com" style={{ color: 'pink', margin: '0 5px' }}>Instagram</a>
      <div>
        <p>&copy; {new Date().getFullYear()} Green Hospitals Pvt Ltd. All rights reserved.</p>
      </div>
    </div>
    </footer>
  </div>
);

function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/signup" element={<Layout><Signup /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/dashboard" component={Dashboard} element={<ProtectedRoute allowedRoles={['staff', 'doctor', 'patient','admin']}><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/appointment" element={<ProtectedRoute allowedRoles={['staff', 'doctor', 'patient','admin']}><Layout><AppointmentComponent /></Layout></ProtectedRoute>}/>
        <Route path="/doctor" element={
          <ProtectedRoute allowedRoles={['staff', 'doctor']}>
            <Layout><DoctorComp /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/patient" element={
          <ProtectedRoute allowedRoles={['staff', 'doctor']}>
            <Layout><PatientComponent /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/allfiles" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Layout><AllFiles /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><AdminComponent /></Layout>
          </ProtectedRoute>
        } />  
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;