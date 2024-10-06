import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className="nav-container">
      <nav>
        <Link to="/audio" className="nav-item">Audio</Link>
        <Link to="/midi" className="nav-item">MIDI</Link>
      </nav>
    </div>
  );
};

export default Navbar;
