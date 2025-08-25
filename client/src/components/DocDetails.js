import React, { useState ,useEffect } from 'react';
import axios from "axios";
import './FileDetails.css';


function DocDetails({username, doctorId, token}){
    const [patientsByDoctor, setPatientsByDoctor] = useState({});
    const [patients, setPatients] = useState([]);
    const [filesByPatient, setFilesByPatient] = useState({}); // Stores files grouped by patient ID
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [downloading, setDownloading] = useState({});
    const [patientId, setPatientId] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchPatientsForDoctor(doctorId);
    }, [doctorId]);

    const fetchPatientsForDoctor = async (doctorId) => {
        setLoading(true);
        try {
            const response = await axios.get(`/doctors/patients/${doctorId}?status=completed`,{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("The response by the server",response.data);
            setPatients(response.data);
            setPatientId(response.data.patientId);
            setLoading(false);
            if (response.status === 200 && response.data.length > 0) {
                setPatientsByDoctor(prev => ({
                    ...prev,
                    [doctorId]: response.data
                }));
            response.data.forEach(patient => {
                fetchFilesForPatient(doctorId, patient.id);
            });
         } else if(response.data.length === 0){
            setMessage(response.data.message);
         } else { setError(response.data.message);
        }
        } catch (error) {
            console.error('Error fetching patients:', error);
            setError('Error fetching files:', error);
            setLoading(false);
        }
    };

    const fetchFilesForPatient = async (doctorId, patientId) => {
        try {
            console.log("The doctorId and patientId",doctorId,patientId);
            setPatientId(patientId);
            const response = await axios.get(`/doctors/files/${doctorId}/patient/${patientId}`,{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });
            if(response.status === 200 && response.data.length > 0){
            setFilesByPatient(prev => ({
                ...prev,
                [patientId]: response.data
            }));
        }else if(response.status === 200 && response.data.length === 0){
            setMessage(response.data.message);
        }else{
             setError(response.data.message);
            
        }
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    const viewFile = async (fileName) => {
        try {
            
          const response = await axios.get('/files/viewUrl', {
            params: { fileName ,username,patientId },
            headers:{
                Authorization: `Bearer ${token}`
            }
        });
          const url = response.data.url;
          window.open(url, '_blank'); // Open the URL in a new tab
        } catch (error) {
          console.error('Failed to open file:', error);
          alert('Failed to open file: ' + error.message);
        }
      };
    
      const downloadFile = async (filename) => {
        if (!patientId) {
            console.error("No patient ID available");
            return; // Optionally handle this situation more gracefully
        }
        setDownloading(prev => ({ ...prev, [filename]: true }));
        try {
            // Trigger the download process
            console.log("Username in download:", username);
            const response = await axios.get('/files/download', { 
                params: { filename, username,patientId },headers: {
                    Authorization:`Bearer ${token}`
                } 
            });
            setMessage(response.data.message);
            alert('File downloaded successfully. '+ response.data.message);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to download the file.');
            }
        } catch (error) {
            console.error("Failed to download file:", error);
            alert("Failed to download the file: " + error.message);
        }finally {
            setDownloading(prev => ({ ...prev, [filename]: false }));
        }
    };


    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return(
        <div class="file-upload-container">
            <h3>Patient Details</h3>
            {patients.map(patient => (
                <div key={patient.id}>
                    <h4>{patient.name}</h4>
                    <ul>
                        {filesByPatient[patient.id]?.map(file => (
                            <li key={file._id}>
                                {file.description} - 
                                <button class="upload-button" onClick={() => viewFile(file.fileName)}>VIEW</button>
                                <button class="upload-button" onClick={() => downloadFile(file.fileName)} disabled={downloading[file.fileName]}>DOWNLOAD</button>
                                {downloading[file.fileName] && <p>Downloading...</p>}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
            {message && <p class="status-message">{message}</p>}
        </div>
    );
    }
export default DocDetails;

