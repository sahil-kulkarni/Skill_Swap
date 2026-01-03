import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const API_URL = 'http://localhost:5000';

function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    const [chats, setChats] = useState([]);
    const [receivedDocs, setReceivedDocs] = useState([]);
    const [sentDocs, setSentDocs] = useState([]);

    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingDocs, setLoadingDocs] = useState(true);

    // 🔐 Auth
    useEffect(() => {
        const unsub = auth.onAuthStateChanged((u) => {
            if (!u) navigate('/login');
            else setUser(u);
        });
        return () => unsub();
    }, [navigate]);

    // 🔧 Helper to fetch Firestore user name by UID
    const fetchUserName = async (uid) => {
        try {
            const snap = await getDoc(doc(db, 'users', uid));
            if (snap.exists()) {
                const u = snap.data();
                return `${u.firstName} ${u.lastName}`;
            }
        } catch (e) {
            console.error(e);
        }
        return uid; // fallback if user not found
    };

    // 💬 Load chats (MongoDB + enrich with names)
    useEffect(() => {
        if (!user) return;

        const loadChats = async () => {
            try {
                const res = await fetch(`${API_URL}/api/chat/list/${user.uid}`);
                const data = await res.json();

                // enrich with other user's name
                const enriched = await Promise.all(
                    data.map(async (chat) => ({
                        ...chat,
                        otherUserName: await fetchUserName(chat.otherUserUid),
                    }))
                );

                setChats(enriched);
            } catch (err) {
                console.error('Failed to load chats', err);
            } finally {
                setLoadingChats(false);
            }
        };

        loadChats();
    }, [user]);

    // 📄 Load documents (MongoDB, user-scoped)
    useEffect(() => {
        if (!user) return;

        const loadDocs = async () => {
            try {
                const [receivedRes, sentRes] = await Promise.all([
                    fetch(`${API_URL}/api/documents/received/${user.uid}`),
                    fetch(`${API_URL}/api/documents/sent/${user.uid}`),
                ]);

                const received = await receivedRes.json();
                const sent = await sentRes.json();

                setReceivedDocs(received);
                setSentDocs(sent);
            } catch (err) {
                console.error('Failed to load documents', err);
            } finally {
                setLoadingDocs(false);
            }
        };

        loadDocs();
    }, [user]);

    return (
        <div style={pageStyle}>
            <div style={headerStyle}>
                <h1>Dashboard</h1>
                <Link to="/" style={linkStyle}>← Back to Home</Link>
            </div>

            <div style={gridStyle}>
                {/* 💬 Chats */}
                <div style={cardStyle}>
                    <h2>Chats</h2>

                    {loadingChats ? (
                        <p>Loading chats…</p>
                    ) : chats.length === 0 ? (
                        <p>No chats yet</p>
                    ) : (
                        chats.map((c) => (
                            <div
                                key={c.chatId}
                                style={itemStyle}
                                onClick={() => navigate(`/chat/${c.otherUserUid}`)}
                            >
                                <div>
                                    <strong>{c.otherUserName}</strong>
                                    <p style={muted}>
                                        {c.lastMessage?.text || 'No messages yet'}
                                    </p>
                                </div>
                                <small>
                                    {c.lastMessage?.timestamp
                                        ? new Date(c.lastMessage.timestamp).toLocaleString()
                                        : ''}
                                </small>
                            </div>
                        ))
                    )}
                </div>

                {/* 📄 Documents */}
                <div style={cardStyle}>
                    <h2>Documents</h2>

                    {loadingDocs ? (
                        <p>Loading documents…</p>
                    ) : (
                        <>
                            <h4>📥 Received</h4>
                            {receivedDocs.length === 0 ? (
                                <p>No received documents</p>
                            ) : (
                                receivedDocs.map((d) => (
                                    <div key={d._id} style={docStyle}>
                                        <span>{d.fileName}</span>
                                        <a href={d.fileUrl} target="_blank" rel="noreferrer">Open</a>
                                    </div>
                                ))
                            )}

                            <h4 style={{ marginTop: 20 }}>📤 Sent</h4>
                            {sentDocs.length === 0 ? (
                                <p>No sent documents</p>
                            ) : (
                                sentDocs.map((d) => (
                                    <div key={d._id} style={docStyle}>
                                        <span>{d.fileName}</span>
                                        <a href={d.fileUrl} target="_blank" rel="noreferrer">Open</a>
                                    </div>
                                ))
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

/* 🎨 Styles */
const pageStyle = { padding: 30, minHeight: '100vh', background: '#f6f9fc', fontFamily: 'Arial' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 };
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 };
const cardStyle = { background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 6px 20px rgba(0,0,0,0.05)' };
const itemStyle = { display: 'flex', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #eee', cursor: 'pointer' };
const docStyle = { display: 'flex', justifyContent: 'space-between', padding: '8px 0' };
const muted = { color: '#666', fontSize: 13 };
const linkStyle = { color: '#0d6efd', textDecoration: 'none' };

export default Dashboard;
