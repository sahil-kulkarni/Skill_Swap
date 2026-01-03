// src/components/Auth.js
import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const skillOptions = ['JavaScript', 'React', 'Python', 'Node.js', 'CSS', 'HTML', 'Django', 'Flutter', 'Java'];

  const toggleSkill = (skill) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        // Basic validation
        if (!firstName.trim() || !lastName.trim()) {
          throw new Error('First and last name are required.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }

        // Create user in Firebase Auth
        const res = await createUserWithEmailAndPassword(auth, email, password);

        // Update auth profile with display name
        const displayName = `${firstName} ${lastName}`.trim();
        await updateProfile(res.user, { displayName });

        // Save additional user data to Firestore (db = Cloud Firestore)
        await setDoc(doc(db, 'users', res.user.uid), {
          uid: res.user.uid,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          displayName,
          email: email.toLowerCase(),
          skills,
          wants: [],
          availability: [],
          rating: 0,
          createdAt: new Date(),
        });

        alert('Registration successful! Welcome!');
      } else {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      let message = err.message;

      // Friendly error messages
      if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Try logging in.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = 'Invalid email or password.';
      }

      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <style>{`
        .auth-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea, #764ba2);
          font-family: Arial, sans-serif;
        }
        .auth-card {
          background: #fff;
          padding: 30px;
          border-radius: 12px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 12px 24px rgba(0,0,0,0.2);
        }
        .auth-card h2 {
          text-align: center;
          margin-bottom: 20px;
          color: #333;
        }
        .auth-card input {
          width: 100%;
          padding: 12px;
          margin-top: 12px;
          border-radius: 6px;
          border: 1px solid #ccc;
          outline: none;
          font-size: 1rem;
          box-sizing: border-box;
        }
        .skills-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
          margin-bottom: 12px;
        }
        .skill-chip {
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid #764ba2;
          color: #764ba2;
          cursor: pointer;
          font-size: 0.9rem;
          user-select: none;
          transition: all 0.2s;
        }
        .skill-chip.selected {
          background: #764ba2;
          color: #fff;
        }
        .btn-submit {
          width: 100%;
          margin-top: 20px;
          padding: 12px;
          background: #764ba2;
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          opacity: ${loading ? 0.7 : 1};
        }
        .btn-submit:disabled {
          cursor: not-allowed;
        }
        .error-message {
          color: #e74c3c;
          text-align: center;
          margin-top: 10px;
          font-size: 0.9rem;
        }
        .toggle-text {
          text-align: center;
          margin-top: 15px;
          color: #764ba2;
          cursor: pointer;
          font-size: 0.95rem;
        }
      `}</style>

      <form className="auth-card" onSubmit={submit}>
        <h2>{isRegister ? 'Register' : 'Login'}</h2>

        {isRegister && (
          <>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />

            <div className="skills-container">
              {skillOptions.map((skill) => (
                <div
                  key={skill}
                  className={`skill-chip ${skills.includes(skill) ? 'selected' : ''}`}
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </div>
              ))}
            </div>
          </>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength="6"
        />

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}
        </button>

        <div className="toggle-text" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </div>
      </form>
    </div>
  );
}

export default Auth;