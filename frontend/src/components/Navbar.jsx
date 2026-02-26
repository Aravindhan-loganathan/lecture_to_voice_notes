import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Home, Settings, Mail, Menu, X } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Home', path: '/', icon: <Home size={20} /> },
        { name: 'About', path: '#about', icon: <BookOpen size={20} /> },
        { name: 'Contact', path: '#contact', icon: <Mail size={20} /> },
    ];

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    <BookOpen className="logo-icon" size={28} />
                    <span>LectureAI</span>
                </Link>

                {/* Mobile Menu Toggle */}
                <button className="mobile-menu-toggle" onClick={toggleMenu}>
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                <div className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.path.startsWith('#') ? link.path : undefined}
                            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.icon}
                            <span>{link.name}</span>
                        </a>
                    ))}
                    <Link
                        to="/class"
                        className="btn-primary"
                        style={{ padding: '10px 20px', borderRadius: '10px' }}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Enter Class
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
