// src/components/EditProfile.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const skillOptions = ['JavaScript', 'React', 'Python', 'Node.js', 'CSS', 'HTML', 'Django', 'Flutter', 'Java', 'TypeScript', 'MongoDB', 'SQL', 'AWS', 'Docker'];

const availabilityOptions = ['Weekdays', 'Evenings', 'Weekends', 'Mornings', 'Afternoons'];

function EditProfile() {
  const { id } = useParams(); // document ID from URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    skills: [],
    wants: [],
    availability: [],
  });

  // Check if user is authenticated and owns this profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        navigate('/login'); // redirect if not logged in
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;

      try {
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          alert('Profile not found');
          navigate('/');
          return;
        }

        const data = docSnap.data();

        // Security: Only allow editing own profile
        if (data.uid !== currentUser.uid) {
          alert('You can only edit your own profile!');
          navigate(`/profile/${id}`);
          return;
        }

        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          skills: data.skills || [],
          wants: data.wants || [],
          availability: data.availability || [],
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        alert('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) fetchProfile();
  }, [id, currentUser, navigate]);

  const toggleArrayItem = (arrayName, item) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].includes(item)
        ? prev[arrayName].filter(i => i !== item)
        : [...prev[arrayName], item]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    try {
      const docRef = doc(db, 'users', id);
      await updateDoc(docRef, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        skills: formData.skills,
        wants: formData.wants,
        availability: formData.availability,
        // Optional: update displayName in auth if you want
      });

      alert('Profile updated successfully!');
      navigate(`/profile/${id}`);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="edit-loading">Loading your profile...</div>;
  }

  return (
    <div className="edit-container">
      <div className="edit-card">
        <h2>Edit Your Profile</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              maxLength="50"
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              maxLength="50"
            />
          </div>

          <div className="form-group">
            <label>Skills I Offer</label>
            <div className="chip-container">
              {skillOptions.map(skill => (
                <div
                  key={skill}
                  className={`chip ${formData.skills.includes(skill) ? 'selected' : ''}`}
                  onClick={() => toggleArrayItem('skills', skill)}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Skills I Want to Learn</label>
            <div className="chip-container">
              {skillOptions.map(skill => (
                <div
                  key={skill}
                  className={`chip want ${formData.wants.includes(skill) ? 'selected' : ''}`}
                  onClick={() => toggleArrayItem('wants', skill)}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Availability</label>
            <div className="chip-container">
              {availabilityOptions.map(option => (
                <div
                  key={option}
                  className={`chip ${formData.availability.includes(option) ? 'selected' : ''}`}
                  onClick={() => toggleArrayItem('availability', option)}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(`/profile/${id}`)}
              className="btn cancel"
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn save"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .edit-container {
          min-height: 100vh;
          background: #f1f5f9;
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .edit-card {
          max-width: 700px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          padding: 40px;
        }

        h2 {
          text-align: center;
          margin-bottom: 30px;
          color: #1e293b;
          font-size: 1.8rem;
        }

        .form-group {
          margin-bottom: 28px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
        }

        input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 1rem;
          box-sizing: border-box;
        }

        input:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .chip-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .chip {
          padding: 8px 16px;
          border-radius: 999px;
          background: #f1f5f9;
          color: #475569;
          cursor: pointer;
          font-size: 0.95rem;
          user-select: none;
          transition: all 0.2s;
          border: 1px solid #e2e8f0;
        }

        .chip.selected {
          background: #4f46e5;
          color: white;
          border-color: #4f46e5;
        }

        .chip.want.selected {
          background: #7c3aed;
          border-color: #7c3aed;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 40px;
        }

        .btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .cancel {
          background: #e2e8f0;
          color: #475569;
        }

        .cancel:hover {
          background: #cbd5e1;
        }

        .save {
          background: #4f46e5;
          color: white;
        }

        .save:hover {
          background: #4338ca;
        }

        .save:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .edit-loading {
          text-align: center;
          padding: 100px;
          font-size: 1.2rem;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}

export default EditProfile;