import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FileDetails.css';


function FileDetails({ appointmentId, username, patientId,token }) {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [downloading, setDownloading] = useState({});
    const [message, setMessage] = useState(''); 
    const [selectedFile, setSelectedFile] = useState(null);
    const [encrypt, setEncrypt] = useState(false);

    useEffect(() => {
        fetchFiles();
    }, [appointmentId]);

    const fetchFiles = async () => {
        try {
            const response = await axios.get(`/files/${appointmentId}`,
                {params:  {username,patientId},headers:{Authorization: `Bearer ${token}`}
            });
            setFiles(response.data);
        } catch (error) {
            console.error('Failed to fetch files:', error);
        }
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);  // Simplified
    };
    

    const handleFileUpload = async () => {
        if (!selectedFile) return; // Do nothing if no file is selected
    
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("fileName", selectedFile.name);
            formData.append("description", selectedFile.name); // You can make this dynamic
            formData.append("appointmentId", appointmentId);
            formData.append("patientId", patientId);
            formData.append("encrypt", encrypt);
    
            const response = await axios.post(`/files/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log("Response from server:", response.data);
            if (response.status === 201) {
                fetchFiles();  // Refresh the list of files after upload
                setMessage('File uploaded successfully!');
                alert('File uploaded successfully!');
            } else {
                throw new Error('Server responded with a non-201 status');
            }
        } catch (error) {
            console.error('Failed to upload file:', error);
            setMessage('Failed to upload file.');
            alert('Failed to upload file: ' + error.message); // Alert the user about the error
        }
        setUploading(false);
        setSelectedFile(null);
    };
    
    const viewFile = async (fileName) => {
        try {
          const response = await axios.get('/files/viewUrl', {
            params: { fileName ,username, patientId },headers:{Authorization: `Bearer ${token}`}
          });
          const url = response.data.url;
          window.open(url, '_blank'); // Open the URL in a new tab
        } catch (error) {
          console.error('Failed to open file:', error);
          alert('Failed to open file: ' + error.message);
        }
      };
    
      const downloadFile = async (filename) => {
        setDownloading(prev => ({ ...prev, [filename]: true }));
        try {
            // Trigger the download process
            console.log("Username in download:", username);
            const response = await axios.get('/files/download', { 
                params: { filename, username,patientId },headers:{Authorization: `Bearer ${token}`} 
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
    

    return (
        <div class="file-upload-container">
            <h4>Files of Patient ID: {patientId}</h4>
            <input type="file" onChange={handleFileChange} disabled={uploading} className='file-input'/>

            {selectedFile && <button class="upload-button" onClick={handleFileUpload} disabled={uploading}>Upload</button>}
            {uploading && <p class="status-message">Uploading...</p>}
            <ul class="file-list">
                {files.map(file => (
                <li key={file._id}>
                    {file.description} - 
                    <button class="upload-button" onClick={() => viewFile(file.fileName)}>VIEW</button>
                    <button class="upload-button" onClick={() => downloadFile(file.fileName)} disabled={downloading[file.fileName]}>DOWNLOAD</button>
                    {downloading[file.fileName] && <p class="status-message">Downloading...</p>}
                </li>
                ))}
            </ul>
            {message && <p class="status-message">{message}</p>}
        </div>

    );
}

export default FileDetails;