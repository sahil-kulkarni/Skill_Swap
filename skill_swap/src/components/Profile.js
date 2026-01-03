import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUser({ id: docSnap.id, ...docSnap.data() });
        } else {
          const q = query(collection(db, 'users'), where('uid', '==', id));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            setUser({ id: userDoc.id, ...userDoc.data() });
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const isOwnProfile = currentUser && user && currentUser.uid === user.uid;

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className="not-found">
        <h2>Profile Not Found</h2>
        <button onClick={() => navigate('/')} className="btn back-btn">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-placeholder">
              {user.firstName?.charAt(0)?.toUpperCase()}
              {user.lastName?.charAt(0)?.toUpperCase()}
            </div>
          </div>
          <div className="profile-info">
            <h1 className="profile-name">
              {user.firstName} {user.lastName}
              {isOwnProfile && <span className="you-badge">(You)</span>}
            </h1>
            <p className="profile-email">{user.email}</p>
            <div className="profile-rating">
              <span className="star">★</span> {user.rating || 0} / 5
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="profile-actions">
          {isOwnProfile ? (
            <>
              <button onClick={() => navigate(`/edit-profile/${user.id}`)} className="btn primary">
                Edit Profile
              </button>
               <button onClick={() => navigate(`home`)} className="btn primary">
                Home
              </button>
            </>
          ) : (
            <>
              <button className="btn primary">Connect</button>
              <button className="btn secondary">Message</button>
            </>
          )}
        </div>

        {/* Skills Offered */}
        <div className="profile-section">
          <h3>Skills I Offer</h3>
          <div className="tags">
            {user.skills?.length > 0 ? (
              user.skills.map((skill, i) => (
                <span key={i} className="tag offer">
                  {skill}
                </span>
              ))
            ) : (
              <p className="empty">No skills listed yet.</p>
            )}
          </div>
        </div>

        {/* Skills Wanted */}
        <div className="profile-section">
          <h3>Skills I Want to Learn</h3>
          <div className="tags">
            {user.wants?.length > 0 ? (
              user.wants.map((want, i) => (
                <span key={i} className="tag want">
                  {want}
                </span>
              ))
            ) : (
              <p className="empty">
                {isOwnProfile ? 'Add skills you’d like to learn!' : 'Not specified'}
              </p>
            )}
          </div>
        </div>

        {/* Availability */}
        <div className="profile-section">
          <h3>Availability</h3>
          <p className="availability">
            {user.availability?.length > 0
              ? user.availability.join(' • ')
              : 'Not specified'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Inline CSS (or move to a separate .css file)
const styles = `
  .profile-container {
    min-height: 100vh;
    background: #f8fafc;
    padding: 40px 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .profile-card {
    max-width: 700px;
    margin: 0 auto;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .profile-header {
    display: flex;
    align-items: center;
    padding: 40px 40px 30px;
    background: #ffffff;
    border-bottom: 1px solid #e5e7eb;
  }

  .profile-avatar {
    flex-shrink: 0;
  }

  .avatar-placeholder {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    font-weight: bold;
    color: #4f46e5;
  }

  .profile-info {
    margin-left: 24px;
  }

  .profile-name {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
  }

  .you-badge {
    font-size: 1rem;
    color: #6366f1;
    background: #e0e7ff;
    padding: 4px 10px;
    border-radius: 20px;
    margin-left: 12px;
  }

  .profile-email {
    margin: 8px 0 12px;
    color: #6b7280;
    font-size: 1.1rem;
  }

  .profile-rating {
    font-size: 1.1rem;
    color: #4b5563;
  }

  .star {
    color: #fbbf24;
    font-size: 1.3rem;
  }

  .profile-actions {
    padding: 0 40px 30px;
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .btn {
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 500;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .primary {
    background: #4f46e5;
    color: white;
    border: none;
  }

  .primary:hover {
    background: #4338ca;
  }

  .secondary {
    background: transparent;
    color: #4f46e5;
    border: 1px solid #c7d2fe;
  }

  .secondary:hover {
    background: #eef2ff;
  }

  .back-btn {
    background: #6b7280;
    color: white;
    border: none;
  }

  .profile-section {
    padding: 24px 40px;
    border-top: 1px solid #e5e7eb;
  }

  .profile-section h3 {
    margin: 0 0 16px;
    font-size: 1.25rem;
    color: #111827;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .tag {
    padding: 8px 16px;
    border-radius: 999px;
    font-size: 0.95rem;
    font-weight: 500;
  }

  .offer {
    background: #ecfdf5;
    color: #065f46;
  }

  .want {
    background: #fef3ff;
    color: #6b21a8;
  }

  .empty {
    color: #9ca3af;
    margin: 0;
  }

  .availability {
    margin: 0;
    color: #374151;
  }

  .loading, .not-found {
    text-align: center;
    padding: 100px 20px;
    color: #374151;
  }

  .not-found h2 {
    margin-bottom: 20px;
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default Profile;