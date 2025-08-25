import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PatientComponent.css';

function AppointmentComponent({ switchTab ,  username, token  }) {
    const [patients, setPatients] = useState([]);
    const [patientId, setPatientId] = useState('');
    const [patientDetails, setPatientDetails] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [doctorId, setDoctorId] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [status, setStatus] = useState('Scheduled');
    const [appointmentType, setAppointmentType] = useState('');
    const [message, setMessage] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        name: '',
        age: '',
        address: '',
        email:'',
        phoneNumber: ''
    });

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await axios.get('/doctors',{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });// Relative path is used.
            setDoctors(response.data); // API returns an array of doctor objects
        } catch (error) {
            console.error('Error fetching doctors:', error);
        }
    };

    const fetchPatientDetails = async () => {
        if (!patientId) {
            setMessage("Please enter a Patient ID to search.");
            return;
        }
        
        // Checking if patientId is numeric using Regular Expression
        if (!/^\d+$/.test(patientId)) {
            setMessage("Patient ID must be numeric.");
            return;
        }
        
        try {
            const response = await axios.get(`/patients/${patientId}`,{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });//Relative path is used.
            if (response.data) {
                setPatientDetails(response.data);
                setMessage('Patient found! You can now book an appointment.');
            } else {
                alert('Received unexpected response from the server.');
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                alert('No patient found with that ID. Redirecting to patient registration...');
                setIsFormVisible(true);
                setMessage('Please complete the new patient registration form.');
            } else {
                alert('Error searching patient: ' + error.message);
                setIsFormVisible(true);
                setMessage('Please complete the new patient registration form.');
            }
        }
    };

    const handleAppointmentBooking = async () => {
        if (!patientDetails || !doctorId || !appointmentDate || !appointmentType) {
            setMessage("Please ensure all fields are filled before booking an appointment.");
            return;
        }
        try {
            const appointmentData = {
                patientId: patientDetails.id,
                doctors:  selectedDoctor._id,
                date: appointmentDate,
                status: status,
                type: appointmentType
            };
    
            const appointmentResponse = await axios.post('/appointments', appointmentData,{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });// Relative path is used.
            setMessage('Appointment booked successfully!');
            alert("Appointment Booked Successfully");
            console.log("Appointment Booked:",appointmentResponse.data)
        } catch (error) {
            console.error('Failed to book appointment:', error);
            setMessage('Failed to book appointment: ' + error.message);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFormToggle = () => {
        setIsFormVisible(prevIsFormVisible => {
            if (prevIsFormVisible) {
                setForm({ name: '', age: '', address: '', phoneNumber: '', email: '' });
                setMessage('');
            }
            return !prevIsFormVisible;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    const processedForm = {
        ...form,
        age: Number(form.age)  // Convert age to a number
    };

    try {
        const response = await axios.post('/patients', processedForm,{
            headers:{
                Authorization: `Bearer ${token}`
            }
        }); // Use POST for adding new patients
        setPatients(prevPatients => [...prevPatients, response.data]); // Add the new patient to the existing list
        setForm({ name: '', age: '', address: '', phoneNumber: '', email: '' }); // Reset form fields
        setMessage('Patient added successfully!');
        setIsFormVisible(false); // Optionally close the form view
    } catch (error) {
        console.error('Error submitting form:', error);
        setMessage('Failed to save patient: ' + error.message);
    }
    };

    return (
        <div className="patient-container">
            <h2>Book an Appointment</h2>
            <button className="patient-details-button" onClick={() => handleFormToggle(null)}>New Patient</button>
            {isFormVisible && (
                <form onSubmit={handleSubmit} className="patient-form">
                    {editingId && <div className="form-group"><input   type="number" name="id" placeholder="Id" value={form.id} onChange={handleChange} disabled /></div>}  {/* Disabled for safety */}
                    <div className="form-group"><input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} /></div>
                    <div className="form-group"><input type="number" name="age" placeholder="Age" value={form.age} onChange={handleChange} /></div>
                    <div className="form-group"><input type="text" name="address" placeholder="Address" value={form.address} onChange={handleChange} /></div>
                    <div className="form-group"><input type="text" name="phoneNumber" placeholder="Phone Number" value={form.phoneNumber} onChange={handleChange} /></div>
                    <div className="form-group"><input type="text" name="email" placeholder="E-Mail" value={form.email} onChange={handleChange} /></div><br/>
                    <button type="submit" className="patient-details-button">{editingId ? 'Update' : 'Add'}</button>
                </form>
            )}
            <div className="form-group"><input
                type="text"
                value={patientId}
                onChange={(e) => {
                    // Allow changes only if the new value is empty or numeric
                    if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
                        setPatientId(e.target.value);
                    }}}
                placeholder="Search Patient ID"
            /></div><br/>
            <button onClick={fetchPatientDetails} className="patient-details-button">Search Patient</button>
            {message && <p>{message}</p>}
            {patientDetails && (
                <>
                    <div>
                        <h4>Patient Details:</h4>
                        <p>PatientId: {patientDetails.id}</p>
                        <p>Name: {patientDetails.name}</p>
                        <p>Age: {patientDetails.age}</p>
                        <p>Address: {patientDetails.address}</p>
                        <p>Phone: {patientDetails.phoneNumber}</p>
                    </div>
                    <div className='patient-form'>
                    <div className="form-group">
                    <select className="select-dropdown"
                        value={selectedDoctor ? selectedDoctor._id : ''}
                        onChange={(e) => {
                            const doc = doctors.find(doc => doc._id === e.target.value);
                            setSelectedDoctor(doc || null); // Here Setting the entire doctor object or null if not found
                            setDoctorId(doc ? doc._id : '');
                        }}
                        disabled={doctors.length === 0}
                    >
                        <option value="">Select Doctor</option>
                        {Array.isArray(doctors) && doctors.map(doctor => (
                            <option key={doctor._id} value={doctor._id}>
                                {doctor.name} - {doctor.department}
                        </option>
                        ))}
                    </select>
                    </div>
                    <div className="form-group">
                    <input
                        type="date"
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                    />
                    </div>
                    <div className="form-group">
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="select-dropdown"
                    >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="No Show">No Show</option>
                    </select>
                    </div>
                    <div className="form-group">
                    <select 
                        value={appointmentType}
                        onChange={(e) => setAppointmentType(e.target.value)}
                        required
                        className="select-dropdown"
                        >
                            <option value="" disabled selected>Select Appointment Type</option>
                            <option value="Initial Assessment">Initial Assessment</option>
                            <option value="Follow-Up">Follow-Up</option>
                        </select></div><br/>
                        {/* Below div should be removed after debugging*/}
                    <button className="patient-details-button" onClick={handleAppointmentBooking} disabled={!doctorId || !appointmentDate || !appointmentType || doctors.length === 0}>Book Appointment</button>
                        </div>
                </>
            )}
        </div>
    );
}

export default AppointmentComponent;
