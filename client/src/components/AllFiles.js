import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FileDetails.css';

function AllFiles({ username,token }) {
    //const [files, setFiles] = useState([]);
    const [filesByDoctor, setFilesByDoctor] = useState({});
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState({});
    const [message, setMessage] = useState('');
    const [patientId, setPatientId] = useState(null);


    useEffect(() => {
        const fetchPatientId = async () => {
            try {
                const patientResponse = await axios.get(`/allfiles/patient/by-username/${username}`,{
                    headers:{
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log("The message is:",patientResponse.data.message);
                if (patientResponse.data.patientId) {
                    setPatientId(patientResponse.data.patientId);
                    fetchFiles(patientResponse.data.patientId);
                } else {
                    setMessage("No patient found for this username.");
                    setLoading(false);
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    // Handle 404 specifically
                    setMessage("No patient found for this username.");
                } else {
                    console.error('Error fetching patient:', error);
                    setMessage("Error fetching patient details.");
                }
                setLoading(false);
            }
        };fetchPatientId();
    }, [username]);;

        const fetchFiles = async (patientId) => {
            try {
                console.log("The patient ID in while fetching Files:",patientId);
                const response = await axios.get(`/allfiles/patient/${patientId}`,{
                    headers:{
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log("The response from server:",response.data);
                if (Object.keys(response.data).length) {
                    setFilesByDoctor(response.data);
                    setMessage('');
                } else {
                    setMessage("No files found.");
                }
            } catch (error) {
                console.error('Error fetching files:', error);
                setMessage("Failed to fetch files.");
            } finally {
                setLoading(false);
            }
        };

    const viewFile = async (fileName) => {
        try {
            
          const response = await axios.get('/allfiles/viewUrlpatient', {
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
            const response = await axios.get('/allfiles/downloadpatient', { 
                params: { filename, username,patientId },
                headers:{
                    Authorization: `Bearer ${token}`
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
    if (!Object.keys(filesByDoctor).length && !loading) return <p>{message}</p>;
    if (!patientId) return <p>No patient information available.</p>;

    return (
        <div class="file-upload-container">
            <h2>All Files</h2>
            {Object.keys(filesByDoctor).map(doctorName => (
                <div key={doctorName}>
                    <h3>{doctorName}</h3>
                    <ul class="file-list">
                        {filesByDoctor[doctorName].map(file => (
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

export default AllFiles;
