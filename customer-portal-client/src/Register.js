// src/Register.js

import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
    const [fullName, setFullName] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    // Function to get CSRF token
    const getCsrfToken = async () => {
        const response = await axios.get('/csrf-token');
        return response.data.csrfToken;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();  // Prevent the default form submission

        try {
            const csrfToken = await getCsrfToken(); // Get CSRF token
            const response = await axios.post('/register', {
                fullName,
                idNumber,
                accountNumber,
                password,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,  // Include the CSRF token in the headers
                },
            });

            setMessage(response.data.message);  // Display success message
            // Clear the form fields
            setFullName('');
            setIdNumber('');
            setAccountNumber('');
            setPassword('');
        } catch (error) {
            if (error.response && error.response.data) {
                setMessage(error.response.data.message);  // Display error message
            } else {
                setMessage('An unexpected error occurred.');  // Fallback error message
            }
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)} 
                    required 
                />
                <input 
                    type="text" 
                    placeholder="ID Number" 
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)} 
                    required 
                />
                <input 
                    type="text" 
                    placeholder="Account Number" 
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <button type="submit">Register</button>
            </form>
            {message && <div id="message">{message}</div>}
        </div>
    );
};

export default Register;
