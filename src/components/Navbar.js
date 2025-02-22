import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#001f3d', width: '100%', padding: '20px 0' }}>
      <div className="container-fluid">
        <span className="navbar-brand mx-auto" style={{ fontSize: '24px' }}>
          DBTsite
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
