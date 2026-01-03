import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();

        if (
            email === "admin@gmail.com" &&
            password === "admin"
        ) {
            localStorage.setItem('isAdmin', 'true');
            navigate('/admin');
        } else {
            setError('Invalid admin credentials');
        }
    };

    return (
        <div style={page}>
            <form onSubmit={handleLogin} style={box}>
                <h2>Admin Login</h2>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <input
                    placeholder="Admin Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={input}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={input}
                />

                <button style={btn}>Login</button>
            </form>
        </div>
    );
}

const page = {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f6f9fc'
};

const box = {
    background: '#fff',
    padding: 30,
    borderRadius: 12,
    width: 350,
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
};

const input = {
    width: '100%',
    padding: 12,
    marginBottom: 12
};

const btn = {
    width: '100%',
    padding: 12,
    background: '#0d6efd',
    color: '#fff',
    border: 'none',
    borderRadius: 6
};

export default AdminLogin;
