import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const API_URL = 'http://localhost:5000';

function Connect() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [otherUser, setOtherUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) navigate('/login');
      else setCurrentUser(user);
    });
    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    if (!userId || !currentUser) return;

    const fetchOtherUser = async () => {
      try {
        const userDocRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setOtherUser({
            id: docSnap.id,
            uid: data.uid,
            firstName: data.firstName,
            lastName: data.lastName,
          });
        } else {
          alert('User not found');
          navigate('/');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to load user');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchOtherUser();
  }, [userId, currentUser, navigate]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.size > 10 * 1024 * 1024) {
      alert('File too large (max 10MB)');
      return;
    }
    setFile(selected);
  };

  const handleShareDocument = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const idToken = await currentUser.getIdToken();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('fromUid', currentUser.uid);
      formData.append('toUid', otherUser.uid);

      const response = await fetch(`${API_URL}/api/documents/share`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      alert('Document shared successfully!');
      setFile(null);
    } catch (err) {
      console.error(err);
      alert('Failed to share: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading...</div>;
  if (!otherUser) return null;

  return (
    <div style={{ padding: '40px 20px', minHeight: '100vh', background: '#f6f9fc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2rem', color: '#333' }}>
          Connect with {otherUser.firstName} {otherUser.lastName}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          <Link to={`/chat/${otherUser.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={optionCardStyle}>
              <div style={{ fontSize: '4.5rem', marginBottom: '20px' }}>💬</div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.5rem' }}>Start Chat</h3>
              <p style={{ margin: 0, color: '#666', lineHeight: '1.5' }}>Send messages and share ideas in real-time.</p>
            </div>
          </Link>

          <div style={optionCardStyle}>
            <div style={{ fontSize: '4.5rem', marginBottom: '20px' }}>📄</div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.5rem' }}>Share Document</h3>
            <p style={{ margin: '0 0 20px 0', color: '#666', lineHeight: '1.5' }}>Offer resources, notes, or files directly.</p>

            <input id="file-upload" type="file" onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip" />

            <button
              onClick={() => document.getElementById('file-upload').click()}
              style={{ ...btnStyle, width: '100%', background: '#6c757d', marginBottom: file ? '12px' : 0 }}
            >
              Choose File
            </button>

            {file && (
              <>
                <p style={{ textAlign: 'center', margin: '12px 0', color: '#0d6efd', fontWeight: '500' }}>
                  Selected: {file.name}
                </p>
                <button onClick={handleShareDocument} disabled={uploading} style={{ ...btnStyle, width: '100%' }}>
                  {uploading ? 'Sharing...' : 'Share Document'}
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <button onClick={() => navigate(-1)} style={secondaryBtnStyle}>← Back to Users</button>
        </div>
      </div>
    </div>
  );
}


// Styles (unchanged)
const optionCardStyle = {
  background: 'white',
  padding: '40px 20px',
  borderRadius: '16px',
  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
  textAlign: 'center',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
};

const btnStyle = {
  background: '#0d6efd',
  color: 'white',
  border: 'none',
  padding: '14px 20px',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '1.1rem',
  fontWeight: '600',
  transition: 'background 0.2s',
};

const secondaryBtnStyle = {
  background: 'transparent',
  color: '#0d6efd',
  border: '2px solid #0d6efd',
  padding: '12px 28px',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '1.1rem',
  fontWeight: '600',
};

export default Connect;


