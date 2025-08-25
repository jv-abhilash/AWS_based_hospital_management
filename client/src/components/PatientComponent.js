import React, { useState ,useEffect } from 'react';
import axios from "axios";
import Details from './Details';
import './PatientComponent.css';

function PatientComponent({ username, token }) {
    const [patients, setPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState(null);// New line written
    const [detailsVisible, setDetailsVisible] = useState(false); // New line added.
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [currentPatient, setCurrentPatient] = useState(null);
    const [form, setForm] = useState({
        name: '',
        age: '',
        address: '',
        email:'',
        phoneNumber: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await axios.get('/patients',
                {params:  {username},headers:{Authorization: `Bearer ${token}`}
            });// Relative path is used.
            if (Array.isArray(response.data)) {
                setPatients(response.data);
            } else {
                console.error('Expected an array but got:', typeof response.data);
                setPatients([]);
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };
    const toggleDetails = (patientId) => {
        // Toggle details visibility and set the selected patient ID
        if (selectedPatientId === patientId && detailsVisible) {
            setDetailsVisible(false);
            setSelectedPatientId(null);
        } else {
            setDetailsVisible(true);
            setSelectedPatientId(patientId);
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
            age: Number(form.age)  // Age is converted to number
        };
        const method = editingId ? 'put' : 'post';
        const url = editingId ? `/patients/${editingId}` : '/patients'; // Relative paths are used.

        try {
            const response = await axios[method](url, processedForm,{headers:{Authorization: `Bearer ${token}`}});
            if (editingId) {
                setPatients(patients.map(patient => patient._id === editingId ? response.data : patient));
            } else {
                setPatients([...patients, response.data]);
            }
            setForm({ name: '', age: '', address: '',email:'', phoneNumber: '' }); // Reset form
            setEditingId(null);
            setMessage(editingId ? 'Patient updated successfully!' : 'Patient added successfully!');
            setIsFormVisible(false);
            setCurrentPatient(null);
        } catch (error) {
            console.error('Error submitting form:', error);
            setMessage('Failed to save patient.');
        }
    };

    const handleEditClick = (patient) => {
        handleFormToggle(patient); // Show the form and set the patient for editing
        editPatient(patient); // Additional logic if needed for editing
    };

    const editPatient = (patient) => {
        setForm({
            id: patient.id, // Include id for editing but not for new adds
            name: patient.name,
            age: patient.age,
            address: patient.address,
            email:patient.email,
            phoneNumber: patient.phoneNumber
        });
        setEditingId(patient._id);
    };

    const deletePatient = async (id) => {
        try {
            await axios.delete(`/patients/${id}`,{headers:{Authorization: `Bearer ${token}`}});// Relative path is used.
            setPatients(patients.filter(patient => patient._id !== id));
            setMessage('Patient deleted successfully.');
        } catch (error) {
            console.error('Error deleting patient:', error);
            setMessage('Failed to delete patient.');
        }
    };

    const addNewPatient = () => {
        setForm({ name: '', age: '', address: '',email:'', phoneNumber: '' });
        setEditingId(null);
    };

    const toggle = (patientId) => {
        setDetailsVisible(prev => ({
            ...prev,
            [patientId]: !prev[patientId]
        }));
    };

    return (
        <div className="patient-container">
            <h3>Patient Records</h3>
            {message && <p>{message}</p>}
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
            <ul className="patient-list">
                {patients.map(patient => (
                    <li key={patient._id} className="patient-item">
                        <div onClick={() => toggle(patient._id) } style={{ cursor: 'pointer', marginBottom: '8px' }}>
                            {patient.name} - {patient.age}
                        </div>
                        {detailsVisible[patient._id] && (
                            <div style={{ marginBottom: '10px' }}>
                                <button onClick={() => handleEditClick(patient)} className="patient-details-button" style={{ marginRight: '10px' }}>Edit</button>
                                <button onClick={() => deletePatient(patient._id)} className="patient-details-button" style={{margin: '10px'}}>Delete</button>
                            </div>
                        )}
                            {/*{patient.age} - {patient.address} - {patient.phoneNumber}
                            <button onClick={() => editPatient(patient)} className="patient-details-button">Edit</button>
                            <button onClick={() => deletePatient(patient._id)} className="patient-details-button">Delete</button>*/}
                            <button onClick={() => toggleDetails(patient.id)} className="patient-details-button">
                                {selectedPatientId === patient.id && detailsVisible ? 'Hide Details' : 'Show Details'}
                            </button>
                    </li>
                ))}
            </ul>
            {detailsVisible && selectedPatientId && <Details username={username} patientId={selectedPatientId} token={token}/>}
        </div>
    );
}

export default PatientComponent;