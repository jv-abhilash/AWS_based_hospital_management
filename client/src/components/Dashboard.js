import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorComp from './DoctorComp';
import PatientComponent from './PatientComponent';
import AppointmentComponent from './AppointmentComponent';
import AllFiles from './AllFiles';
import useDocumentTitle from '../hooks/useDocumentTitle';
import './Dashboard.css';
import AdminComponent from './AdminComponent';


 
function Dashboard() {
    useDocumentTitle('Dashboard');
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('appointment');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/'); // Relative path is used.
    };

    const switchTab = (tabName) => {
        setActiveTab(tabName);
    };

    return (
        <div className="dashboard-container">
            <div className="side-menu">
            <button onClick={() => setActiveTab('appointment')}
                        style={{ fontWeight: activeTab === 'appointment' ? 'bold' : 'normal' }}>
                    Book Appointment
                </button>                
                {(role === 'staff' || role === 'doctor') && <button onClick={() => setActiveTab('doctor')}
                        style={{ fontWeight: activeTab === 'doctor' ? 'bold' : 'normal' }}>
                    Doctor
                </button>}
                {(role === 'staff' || role === 'doctor') && <button onClick={() => setActiveTab('patient')}
                        style={{ fontWeight: activeTab === 'patient' ? 'bold' : 'normal' }}>
                    Patient
                </button>}
                {role === 'patient' && <button onClick={() => setActiveTab('allfiles')}
                        style={{ fontWeight: activeTab === 'allfiles' ? 'bold' : 'normal' }}>
                    All Files
                </button>}
                {role === 'admin' && <button onClick={() => setActiveTab('admin')}
                    style={{ fontWeight: activeTab === 'admin' ? 'bold' : 'normal' }}>
                    User Management
                </button>}
            </div >
            <div className="content-area">
                <h2>Dashboard</h2>
                <p>Welcome to your Dashboard, {username}!</p>
                {activeTab === 'appointment' && <AppointmentComponent username={username} token={token} switchTab={switchTab} />}
                {activeTab === 'doctor' && (role === 'staff'|| role === 'doctor') && <DoctorComp username={username} token={token} />}
                {activeTab === 'patient' && (role === 'staff'|| role === 'doctor') && <PatientComponent username={username} token={token}/>}
                {activeTab === 'allfiles' && role === 'patient' && <AllFiles username={username} token={token} switchTab={switchTab}/>}
                {activeTab === 'admin' && role === 'admin' && <AdminComponent token={token}/>}
            </div>
            <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
    );
}

export default Dashboard;
