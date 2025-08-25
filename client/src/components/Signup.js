import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import "./Login.css";

function Signup() {
    useDocumentTitle('SignUp');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [isValid,setIsValid] = useState(true);

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/signup', { username, password });
            console.log(res.data);
            alert("User Created Successfully");
            navigate('/login'); // Redirect to login after signup
        } catch (error) {
            console.error("Signup error:", error.response.data);
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
            <h2>Signup</h2>
            <form onSubmit={handleSignup} className="login-form">
                <div className="form-group">
                    <input type="text" value={username} onChange={handleInputChange} />
                    <label>Username:</label>
                </div>
                <div className="form-group">
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <label>Password:</label>
                </div>
                
                <button className="button" type="submit">Sign Up</button>
            </form>
            {!isValid && <p className="error">Please enter only alphanumeric characters.</p>}
        </div>
    );
}

export default Signup;
