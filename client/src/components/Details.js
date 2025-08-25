import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileDetails from './FileDetails';
import './PatientComponent.css';

function Details({ patientId, username, token }) {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedAppointmentId, setExpandedAppointmentId] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState({});
    const status = 'Scheduled';

    useEffect(() => {
        if (patientId) {
            fetchAppointments(patientId,status);
        }
    }, [patientId]);

    const fetchAppointments = async (patientId,status) => {
        setLoading(true);
        try {
            const url = `/appointments/${patientId}` + (status ? `?status=${status}` : '');
            const response = await axios.get(url,{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });
            setAppointments(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setLoading(false);
        }
    };


    const toggleFilesVisibility = (appointmentId) => {
        if (expandedAppointmentId === appointmentId) {
            setExpandedAppointmentId(null); // Collapse if it's already expanded
        } else {
            setExpandedAppointmentId(appointmentId); // Expand this appointment's files
        }
    };

    const handleStatusSelect = (appointmentId, newStatus) => {
        setSelectedStatus(prev => ({ ...prev, [appointmentId]: newStatus }));
    };

    const confirmStatusChange = async (appointmentId) => {
        const newStatus = selectedStatus[appointmentId];
        if (!newStatus) return;  // Make sure there is a status to update
    
        try {
            await axios.patch(`/appointments/${appointmentId}/status`, { status: newStatus},{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });
            fetchAppointments(patientId);  // Refresh list after update
            setSelectedStatus(prev => ({ ...prev, [appointmentId]: undefined }));  // Clear the temporary status
        } catch (error) {
            console.error('Error updating appointment status:', error);
        }
    };
    


    if (loading) {
        return <p>Loading appointments...</p>;
    }

    return (
        <div className="patient-container">
            <h3>Appointments for Patient ID: {patientId}</h3>
            {appointments.length > 0 ? (
                <ul>
                    {appointments.map(appointment => (
                        <li key={appointment._id}>
                            <p>Date: {new Date(appointment.date).toLocaleDateString()}</p>
                            <p>Status: 
                                <select
                                    value={appointment.status}
                                    onChange={(e) => handleStatusSelect(appointment._id, e.target.value)}
                                    className="select-dropdown">
                                    <option value="scheduled">Scheduled</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </p>
                            <p>Doctor: {appointment.doctorId.name} ({appointment.doctorId.department})</p>
                            <p>Appointment Type: {appointment.appointmentType}</p>
                            <button 
                                onClick={() => confirmStatusChange(appointment._id)} 
                                className="button-spacing patient-details-button">
                                 OK
                            </button>
                            <button onClick={() => toggleFilesVisibility(appointment._id)} className="button-spacing patient-details-button">
                                {expandedAppointmentId === appointment._id && appointment.status === 'scheduled' ? 'Hide Files' : 'Show Files'}
                            </button>
                            {expandedAppointmentId === appointment._id && (<FileDetails username={username} appointmentId={appointment._id} patientId={patientId} token={token} />)}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No appointments found.</p>
            )}
        </div>
    );
}

export default Details;
