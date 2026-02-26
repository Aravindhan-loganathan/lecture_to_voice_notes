import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Cpu, Globe, MessageSquare, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

import heroImage from '../assets/hero_image.png';

const Home = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="home-page"
        >
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-grid">
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="hero-content"
                    >
                        <span className="badge">AI Powered Learning</span>
                        <h1>Transform Lectures <br /> into <span className="text-gradient">Knowledge</span></h1>
                        <p className="hero-description">
                            Upload your lecture audio and get instant transcripts, summaries, flashcards, and interactive quizzes. Powered by state-of-the-art AI models.
                        </p>
                        <div className="hero-actions">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link to="/class" className="btn-primary">
                                    Enter into Class <ArrowRight size={20} />
                                </Link>
                            </motion.div>
                            <a href="#about" className="btn-secondary">Learn More</a>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        whileHover={{
                            scale: 1.02,
                            rotateY: -5,
                            rotateX: 5,
                            transition: { duration: 0.4 }
                        }}
                        className="hero-image-container"
                    >
                        <img src={heroImage} alt="AI Learning Illustration" className="hero-image" />
                        <div className="hero-image-glow"></div>
                    </motion.div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="section section-universe">
                <div className="section-header">
                    <h2>Advanced Intelligence</h2>
                    <p>Our platform leverages the latest in AI technology to provide a seamless learning experience.</p>
                </div>
                <div className="features-grid">
                    <div className="glass-card feature-card">
                        <div className="feature-icon primary">
                            <Cpu size={24} />
                        </div>
                        <h3>SOTA Models</h3>
                        <p>Utilizing Gemini 1.5 Flash and Whisper for high-accuracy transcription and intelligent content generation.</p>
                    </div>
                    <div className="glass-card feature-card">
                        <div className="feature-icon secondary">
                            <Globe size={24} />
                        </div>
                        <h3>Multilinguality</h3>
                        <p>Support for multiple languages, ensuring you can learn in yours or any other language with ease.</p>
                    </div>
                    <div className="glass-card feature-card">
                        <div className="feature-icon accent">
                            <Zap size={24} />
                        </div>
                        <h3>Instant Results</h3>
                        <p>Get your study materials in seconds instead of hours of manual note-taking.</p>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="section contact-section">
                <div className="glass-card contact-card">
                    <div className="contact-info">
                        <h2>Get in Touch</h2>
                        <p>Have questions or suggestions? We'd love to hear from you.</p>
                        <div className="contact-methods">
                            <div className="contact-method">
                                <MessageSquare className="text-primary" />
                                <span>support@lectureai.com</span>
                            </div>
                        </div>
                    </div>
                    <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                        <input type="text" placeholder="Name" className="form-input" />
                        <input type="email" placeholder="Email" className="form-input" />
                        <textarea placeholder="Message" className="form-input" rows="4"></textarea>
                        <button className="btn-primary">Send Message</button>
                    </form>
                </div>
            </section>

            <footer className="footer">
                <p>&copy; 2024 LectureAI. All rights reserved.</p>
            </footer>
        </motion.div>
    );
};

export default Home;
