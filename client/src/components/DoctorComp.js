import React, { useState ,useEffect } from 'react';
import axios from "axios";
import './PatientComponent.css';
import DocDetails from './DocDetails';

function DoctorComp({ username, token }) {
    const [doctors, setDoctors] = useState([]);
    const [form, setForm] = useState({ name: '', department: '', phoneNumber: '', email: '' });
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [currentDoctor, setCurrentDoctor] = useState(null);

    // Fetch all doctors
    useEffect(() => {
        axios.get('/doctors',{
            headers:{
                Authorization: `Bearer ${token}`
            }
        }) // Relative path is used.
        .then(response => {
            if (Array.isArray(response.data)) { 
              setDoctors(response.data);
            } else {
              console.error('Expected an array but got:', typeof response.data);
              setDoctors([]); // Reset or handle non-array responses
            }
          })
          .catch(error => console.error('Error fetching doctors:', error));
      }, []);

    // Handle form changes
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Submit the form to create or update doctor details
    const handleSubmit = (e) => {
        e.preventDefault();
        const method = editingId ? 'put' : 'post';
        const url = editingId ? `/doctors/${editingId}` : '/doctors'; //Relative Path is used

        axios[method](url, form,{
            headers:{
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                setDoctors(editingId ? doctors.map(doc => doc._id === editingId ? response.data : doc) : [...doctors, response.data]);
                setForm({ name: '', department: '', phoneNumber: '', email: '' });
                setEditingId(null);
                setMessage(editingId ? 'Doctor updated successfully!' : 'Doctor added successfully!');
                setIsFormVisible(false);
                setCurrentDoctor(null);
            })
            .catch(error => console.error('Error submitting form:', error));
    };

    const handleEditClick = (doctor) => {
        handleFormToggle(doctor); // Show the form and set the doctor for editing
        editDoctor(doctor); // Additional logic if needed for editing
    };

    const handleFormToggle = (doctor) => {
        setIsFormVisible(prevIsFormVisible => {
            if (prevIsFormVisible) {
                setForm({ name: '', department: '', phoneNumber: '', email: '' });
                setMessage('');
            }
            return !prevIsFormVisible;
        });
    };

    // Set form to edit
    const editDoctor = (doctor) => {
        setForm(doctor);
        setEditingId(doctor._id);
    };

    // Delete a doctor
    const deleteDoctor = (id) => {
        axios.delete(`/doctors/${id}`,{
            headers:{
                Authorization: `Bearer ${token}`
            }
        }) // Relative path is used.
            .then(() => {
                setDoctors(doctors.filter(doc => doc._id !== id));
            })
            .catch(error => console.error('Error deleting doctor:', error));
    };



    const toggleDetails = (doctorId) => {
        // Toggle details visibility and set the selected patient ID
        if (selectedDoctorId === doctorId && detailsVisible) {
            setDetailsVisible(false);
            setSelectedDoctorId(null);
        } else {
            setDetailsVisible(true);
            setSelectedDoctorId(doctorId);
        }
    };


    const toggle = (doctorId) => {
        setDetailsVisible(prev => ({
            ...prev,
            [doctorId]: !prev[doctorId]
        }));
    };

    return (
        <div className="patient-container">
            <h3>Doctor Information</h3>
            {message && <p>{message}</p>}
            <button className="patient-details-button" onClick={() => handleFormToggle(null)} >New Doctor</button>
            {isFormVisible && (
            <form onSubmit={handleSubmit} className="patient-form">
               <div className="form-group"><input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} /></div>
               <div className="form-group"><input type="text" name="department" placeholder="Department" value={form.department} onChange={handleChange} /></div>
               <div className="form-group"><input type="text" name="phoneNumber" placeholder="Phone Number" value={form.phoneNumber} onChange={handleChange} /></div>
               <div className="form-group"><input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} /></div>
               <div className="form-group"><button type="submit" className="patient-details-button">{editingId ? 'Update' : 'Add'}</button></div>
            </form>
            )}
            <ul className="patient-list">
            {Array.isArray(doctors) && doctors.map(doctor => (
                    <li key={doctor._id} className="patient-item">
                        <div onClick={() => toggle(doctor._id) } style={{ cursor: 'pointer', marginBottom: '8px' }}>
                            {doctor.name} - {doctor.department} {/*- {doctor.phoneNumber} - {doctor.email}*/}
                        </div>
                        {detailsVisible[doctor._id] && (
                            <div style={{ marginBottom: '10px' }}>
                                <button onClick={() => handleEditClick(doctor)} className="patient-details-button" style={{margin: '8px'}}>Edit</button>
                                <button onClick={() => deleteDoctor(doctor._id)} className="patient-details-button" style={{margin: '8px'}}>Delete</button>
                            </div>
                        )}
                        <button onClick={() => toggleDetails(doctor._id)} className="patient-details-button">
                                {selectedDoctorId === doctor._id && detailsVisible ? 'Hide Details' : 'Show Details'}
                        </button>
                    </li>
                ))}
            </ul>
            {detailsVisible && selectedDoctorId && <DocDetails username={username} doctorId={selectedDoctorId} token={token}/>}
        </div>
    );

}

export default DoctorComp;