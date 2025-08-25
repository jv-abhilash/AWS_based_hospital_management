import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import useDocumentTitle from '../hooks/useDocumentTitle';

function Home() {
    useDocumentTitle('Home');
    
    return (
        <div className="home-container">
            <h1>Welcome to Hospital Portal System</h1>
            <Link to="/login"><button className="button">Login</button></Link>  
            <Link to="/signup"><button className="button">Signup</button></Link>
        </div>
    );
}

export default Home;
