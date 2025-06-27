import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './sellerProfileStyle.css';

export default function SellerProfile() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const sellerId = localStorage.getItem('userId');
        const authToken = localStorage.getItem('authToken');
        const res = await fetch(
          `http://localhost:8080/auth/sellers/${sellerId}`,
          { headers: { 'Authorization': `Bearer ${authToken}` } }
        );
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    };

    // --- TEMPORARILY DISABLED GUARD ---
    // TODO: Uncomment these lines when session login is in place
    // if (localStorage.getItem('userRole') !== 'SELLER') {
    //   navigate('/');
    //   return;
    // }

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (!profile) {
    return <div className="seller-profile">Loading profile…</div>;
  }

  return (
    <div className="seller-profile">
      <header className="profile-header">
        <h2>Your Profile</h2>
        <div>
          <button onClick={() => navigate('/seller-dashboard')}>
            Dashboard
          </button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <section className="profile-details">
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p>
          <strong>Joined:</strong>{' '}
          {new Date(profile.createdAt).toLocaleDateString()}
        </p>
        {/* add any other seller fields here */}
      </section>
    </div>
  );
}
