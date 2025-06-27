import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="home-container">
      {['car', 'bike', 'truck'].map((type) => (
        <div key={type} className="home-box" onClick={() => navigate(`/${type}`)}>
          <h2>{type.toUpperCase()}</h2>
        </div>
      ))}
    </div>
  );
};
export default Home;
