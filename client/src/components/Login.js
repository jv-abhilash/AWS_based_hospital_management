import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import "./Login.css";

function Login() {
    useDocumentTitle('Login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [isValid,setIsValid] = useState(true);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/login', { username, password });
            if (res.data.token && res.data.username && res.data.role) {
                localStorage.setItem('token', res.data.token); // Saving token to local storage
                localStorage.setItem('username', res.data.username); // Saving username to local storage
                localStorage.setItem('role',res.data.role);
            }
            else {
                console.error('No token or username or No role received');
            }
            navigate('/dashboard'); // Redirect to dashboard on success
        } catch (error) {
                console.error("Login error:", error.response.data);
                if (error.response.status === 404) {
                    alert('User does not exist. Please sign up.'); // Notify user
                    navigate('/signup'); // Navigate to signup page
                } else {
                    alert('Login failed: ' + (error.response.data.message || 'Please try again.')); // Handle other errors
                }
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (/^[a-zA-Z0-9]*$/.test(value) || value === '') {
            setUsername(value);
            setIsValid(true); // Input is valid
        } else {
            setIsValid(false); // Input is invalid, show error message
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
            <input
                type="text"
                id="username"
                value={username}
                onChange={handleInputChange}
                required
            />
            <label htmlFor="username">Username</label>
        </div>
        <div className="form-group">
            <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <label htmlFor="password">Password</label>
        </div>
        <button type="submit" className="button">Log In</button>
    </form>
    {!isValid && <p className="error">Please enter only alphanumeric characters.</p>}
</div>
    );
}

export default Login;
