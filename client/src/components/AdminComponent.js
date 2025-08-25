import React, { useState ,useEffect } from 'react';
import axios from "axios";
import './PatientComponent.css';

function AdminComponent({token}) {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [detailsVisible, setDetailsVisible] = useState({});
    const [selectedRole,setSelectedRole] = useState({});

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/admin',{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (Array.isArray(response.data)){
                console.log("Full response data:", response.data);

                setUsers(response.data);
                setLoading(false);
                // Initialize selected roles
                const rolesInit = {};
                response.data.forEach(user => {
                    rolesInit[user._id] = user.role;
                });
                setSelectedRole(rolesInit);
            }
            else{
                console.error('Expected an array but got:', typeof response.data);
                setUsers([]);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.get(`/admin/search?name=${encodeURIComponent(searchTerm)}`,{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("The search Response:",response.data);
            setUsers(response.data); // Assuming the API returns the filtered list
        } catch (error) {
            console.error('Error searching users:', error);
        }
    };

    const updateRole = async (userId, newRole) => {
        try {
            await axios.patch(`/admin/${userId}/role`, { role: newRole },{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });
            alert('Role updated successfully!');
            fetchUsers(); // Refresh the list to show updated roles
        } catch (error) {
            console.error('Failed to update user role:', error);
        }
    };

    const toggle = (userId) => {
        setDetailsVisible(prev => ({ ...prev, [userId]: !prev[userId] }));
    };

    const handleRoleChange = (userId, newRole) => {
        setSelectedRole(prev => ({ ...prev, [userId]: newRole }));
    };

    return (
        <div className="patient-container">
            <h1>Admin Panel</h1>
            <form onSubmit={handleSearch}>
                <div className="form-group">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                /></div><br/>
                <button type="submit" className="patient-details-button">Search</button>
            </form>
            <ul>
                {loading ? <p>Loading...</p> : users.map(user => (
                    <li key={user._id} className="patient-item">
                        <div onClick={() => toggle(user._id) } style={{ cursor: 'pointer', marginBottom: '8px' }}>
                            {user.username} - {user.role}
                        </div>
                        {detailsVisible[user._id] && (<div>
                            <select value={selectedRole[user._id]} onChange={(e) => handleRoleChange(user._id, e.target.value)} className="select-dropdown">
                            <option value="patient">Patient</option>
                            <option value="staff">Staff</option>
                            <option value="doctor">Doctor</option>
                        </select>
                        <button onClick={() => updateRole(user._id, selectedRole[user._id])} className="patient-details-button">Set Role</button>
                        </div>
                    )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AdminComponent;