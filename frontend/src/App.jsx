import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ClassPage from './pages/ClassPage';
import QuizPage from './pages/QuizPage';
import { AnimatePresence } from 'framer-motion';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/class" element={<ClassPage />} />
            <Route path="/quiz" element={<QuizPage />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;
