// src/components/Home.js (Updated: Change Connect button to link to /connect/${u.id} and Dashboard link)
import React, { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function Home() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [skillOptions, setSkillOptions] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  // Fetch users from Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const allUsers = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUsers(allUsers);

        // Get unique skills
        const skillsSet = new Set();
        allUsers.forEach((u) => (u.skills || []).forEach((s) => skillsSet.add(s)));
        setSkillOptions(Array.from(skillsSet).sort());
      },
      (error) => {
        console.error('Firestore error:', error);
        setUsers([]);
        setSkillOptions([]);
      }
    );

    return () => unsub();
  }, []);

  // Track current user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUserId(user ? user.uid : null);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Logout failed');
    }
  };

  // Filter users dynamically
  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase();
    return users.filter((u) => {
      // Exclude self
      if (currentUserId && u.id === currentUserId) return false;

      // Filter by skill
      if (filterSkill && !(u.skills || []).map((s) => s.toLowerCase()).includes(filterSkill.toLowerCase())) return false;

      // Filter by search
      if (query) {
        const fullText = `${u.firstName || ''} ${u.lastName || ''} ${u.email || ''} ${(u.skills || []).join(' ')}`.toLowerCase();
        return fullText.includes(query);
      }

      return true;
    });
  }, [users, currentUserId, filterSkill, search]);

  // Get current user's document ID
  const myDocId = useMemo(() => {
    if (!currentUserId) return null;
    const docUser = users.find((u) => u.uid === currentUserId || u.id === currentUserId);
    return docUser ? docUser.id : currentUserId;
  }, [users, currentUserId]);

  // Compute initials for profile circle
  const myInitials = useMemo(() => {
    if (!myDocId) {
      const u = auth.currentUser;
      if (u?.displayName) return u.displayName.split(' ').map((n) => n[0]).slice(0, 2).join('');
      if (u?.email) return u.email.charAt(0).toUpperCase();
      return 'U';
    }
    const docUser = users.find((x) => x.id === myDocId);
    if (docUser) return ((docUser.firstName?.charAt(0) || '') + (docUser.lastName?.charAt(0) || '')).toUpperCase();
    const u = auth.currentUser;
    if (u?.displayName) return u.displayName.split(' ').map((n) => n[0]).slice(0, 2).join('');
    if (u?.email) return u.email.charAt(0).toUpperCase();
    return 'U';
  }, [myDocId, users]);

  return (
    <div style={{ padding: '30px', minHeight: '100vh', background: '#f6f9fc', fontFamily: 'Arial' }}>
      {/* Topbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>Skills Swap</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="text"
            placeholder="Search name, email or skill"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 999, border: '1px solid #ccc' }}
          />
          <select
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 12, border: '1px solid #ccc' }}
          >
            <option value="">All Skills</option>
            {skillOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <Link to="/dashboard" style={{ textDecoration: 'none', padding: '6px 12px', borderRadius: 8, border: '1px solid #0d6efd', color: '#0d6efd' }}>
            Dashboard
          </Link>

          {myDocId && (
            <Link
              to={`/profile/${myDocId}`}
              style={{
                width: 40, height: 40, borderRadius: '50%', background: '#0d6efd',
                color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 700, textDecoration: 'none',
              }}
            >
              {myInitials}
            </Link>
          )}
          <button
            onClick={handleLogout}
            style={{ background: '#ff5c5c', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 8, cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Hero */}
      <h2>Discover Skilled People</h2>
      <p>Find people who can teach the skills you want and offer what you know in return.</p>

      {/* User Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20, marginTop: 20 }}>
        {filteredUsers.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 20, background: '#fff', borderRadius: 12 }}>
            No users found.
          </div>
        ) : (
          filteredUsers.map((u) => (
            <div key={u.id} style={{ borderRadius: 12, padding: 18, background: '#fff', boxShadow: '0 6px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#212529', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {(u.firstName?.charAt(0) || 'U') + (u.lastName?.charAt(0) || '')}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{u.firstName} {u.lastName}</div>
                  <div style={{ color: '#6c757d', fontSize: 12 }}>{u.email}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {(u.skills || []).map((s, i) => (
                  <div key={i} style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: 999, fontSize: 12 }}>{s}</div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                <Link to={`/profile/${u.id}`} style={{ textDecoration: 'none', border: '1px solid #ccc', padding: '6px 10px', borderRadius: 8 }}>View Profile</Link>
                <Link to={`/connect/${u.id}`} style={{ background: '#0d6efd', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 8, textDecoration: 'none', textAlign: 'center', flex: 1 }}>Connect</Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;
