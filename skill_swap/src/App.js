import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import {
  signInWithEmailAndPassword,  // For email/password sign-in
  createUserWithEmailAndPassword,  // For sign-up
  signOut,  // For logout
  onAuthStateChanged,  // For listening to auth changes
  // Optional: For Google sign-in
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);  // Toggle sign-up vs. sign-in

  // Listen for auth state changes (e.g., user logged in/out)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log('User is signed in:', currentUser.email);
      } else {
        console.log('User is signed out');
      }
    });
    return () => unsubscribe();  // Cleanup on unmount
  }, []);

  // Handle email/password auth (sign-in or sign-up)
  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        // Sign up new user
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Sign in existing user
        await signInWithEmailAndPassword(auth, email, password);
      }
      // Clear form on success
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Auth error:', error.message);
      alert(`Error: ${error.message}`);  // Simple UI feedback
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };

  // Optional: Google sign-in
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google sign-in error:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h1>Firebase Auth Demo</h1>
      
      {user ? (
        // Logged-in view
        <div>
          <p>Welcome, <strong>{user.email}</strong>!</p>
          <p>UID: {user.uid}</p>  {/* Unique user ID */}
          <button 
            onClick={handleLogout} 
            style={{ padding: '10px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Sign Out
          </button>
        </div>
      ) : (
        // Login/Sign-up form
        <div>
          <form onSubmit={handleAuth}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
            />
            <button 
              type="submit"
              style={{ width: '100%', padding: '10px', background: '#2ed573', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: '10px' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button 
              type="button" 
              onClick={() => setIsSignUp(!isSignUp)}
              style={{ background: 'none', border: 'none', color: '#3742fa', cursor: 'pointer' }}
            >
              {isSignUp ? ' Sign In' : ' Sign Up'}
            </button>
          </p>

          <hr style={{ margin: '20px 0' }} />
          
          {/* Optional Google button */}
          <button 
            onClick={signInWithGoogle}
            style={{ width: '100%', padding: '10px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Sign In with Google
          </button>
        </div>
      )}
    </div>
  );
}

export default App;