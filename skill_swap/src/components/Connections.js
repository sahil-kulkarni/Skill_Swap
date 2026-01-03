import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    axios.get('/api/users/me').then(res => {  // Updated: Relative path
      setConnections(res.data.connections || []);
      setRequests(res.data.connectionRequests?.filter(r => r.status === 'pending') || []);
    });
  }, []);

  const accept = (fromId) => {
    axios.post(`/api/connect/accept/${fromId}`).then(() => alert('Accepted'));  // Updated: Relative path
  };

  const reject = (fromId) => {
    axios.post(`/api/connect/reject/${fromId}`).then(() => alert('Rejected'));  // Updated: Relative path
  };

  return (
    <div>
      <h2>Connections</h2>
      {connections.map((conn) => (
        <div key={conn._id} className="card mb-2 p-2">
          {conn.email}
          <Link to={`/chat/${[auth.currentUser.uid, conn.firebaseUid].sort().join('-')}`} className="btn btn-sm btn-primary ms-2">Chat</Link>
        </div>
      ))}

      <h2>Requests</h2>
      {requests.map((req) => (
        <div key={req.from._id} className="card mb-2 p-2">
          From: {req.from.email}
          <button className="btn btn-sm btn-success ms-2" onClick={() => accept(req.from._id)}>Accept</button>
          <button className="btn btn-sm btn-danger ms-2" onClick={() => reject(req.from._id)}>Reject</button>
        </div>
      ))}
    </div>
  );
};

export default Connections;