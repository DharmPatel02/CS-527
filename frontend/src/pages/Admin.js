// CustomerRepAndAdmin.jsx
import React, { useEffect, useState } from 'react';
import './Admin.css';

function Admin() {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState(null);
  const [newRep, setNewRep] = useState({ username: '', password: '', email: '' });

  useEffect(() => {
    fetch('http://localhost:8080/admin/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('Failed to load users:', err));
  }, []);

  const createRep = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:8080/admin/create-customer-rep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newRep,
        role: 'customer_rep'
      })
    });
    const result = await response.json();
    if (response.ok) {
      alert('Customer representative created!');
      setNewRep({ username: '', password: '', email: '' });
    } else {
      alert(result.message || 'Failed to create customer rep');
    }
  };

  const fetchReports = async () => {
    const response = await fetch('http://localhost:8080/admin/sales-report');
    const data = await response.json();
    setReports(data);
  };

  return (
    <div className="admin-rep-panel">
      <h2>Admin & Customer Representative Panel</h2>

      <section className="create-rep">
        <h3>Create Customer Representative</h3>
        <form onSubmit={createRep}>
          <input name="username" value={newRep.username} onChange={(e) => setNewRep({ ...newRep, username: e.target.value })} placeholder="Username" required />
          <input name="password" type="password" value={newRep.password} onChange={(e) => setNewRep({ ...newRep, password: e.target.value })} placeholder="Password" required />
          <input name="email" type="email" value={newRep.email} onChange={(e) => setNewRep({ ...newRep, email: e.target.value })} placeholder="Email" required />
          <button type="submit">Create Rep</button>
        </form>
      </section>

      <section className="report-section">
        <h3>Sales Summary</h3>
        <button onClick={fetchReports}>Generate Report</button>
        {reports && (
          <div className="report-data">
            <p><strong>Total Earnings:</strong> £{reports.total_earnings}</p>
            <p><strong>Best Selling Item:</strong> {reports.best_selling_item}</p>
            <p><strong>Top Buyer:</strong> {reports.top_buyer}</p>
            <p><strong>Earnings Per User:</strong></p>
            <ul>
              {reports.earnings_by_user.map(user => (
                <li key={user.username}>{user.username}: £{user.earnings}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

export default Admin;
