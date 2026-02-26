import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

const MOCK_QUIZ = [
    {
        question: "What technology revolutionized Natural Language Processing (NLP)?",
        options: ["RNNs", "LSTMs", "Transformer models", "Markov Chains"],
        answer: 2
    },
    {
        question: "What is considered the 'next big thing' in AI software development?",
        options: ["Static websites", "Agentic workflows", "Manual testing", "Desktop applications"],
        answer: 1
    },
    {
        question: "Why are evaluation frameworks necessary in AI?",
        options: ["To make them slower", "To increase costs", "To ensure robustness and ethics", "To bypass laws"],
        answer: 2
    }
];

const QuizPage = () => {
    const [quizData, setQuizData] = useState(() => {
        const saved = localStorage.getItem('lecture_quiz');
        return saved ? JSON.parse(saved) : MOCK_QUIZ;
    });
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const navigate = useNavigate();

    const handleOptionClick = (index) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);

        if (index === quizData[currentStep].answer) {
            setScore(score + 1);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#8b5cf6', '#ec4899', '#3b82f6']
            });
        }
    };

    const nextQuestion = () => {
        if (currentStep < quizData.length - 1) {
            setCurrentStep(currentStep + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setIsFinished(true);
        }
    };

    const restartQuiz = () => {
        setCurrentStep(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setIsFinished(false);
    };

    if (isFinished) {
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="quiz-finished container"
            >
                <div className="glass-card result-card">
                    <Award size={80} className="text-primary" />
                    <h2>Quiz Completed!</h2>
                    <div className="score-display">
                        <span className="score-num">{score}</span>
                        <span className="score-total">/ {quizData.length}</span>
                    </div>
                    <p>Great job! You've mastered the key concepts of this lecture.</p>
                    <div className="finish-actions">
                        <button className="btn-secondary" onClick={restartQuiz}>
                            <RotateCcw size={18} /> Restart
                        </button>
                        <button className="btn-primary" onClick={() => navigate('/')}>
                            Back to Home
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    const currentQuestion = quizData[currentStep];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="quiz-page container"
        >
            <div className="quiz-header">
                <div className="quiz-progress">
                    <span>Question {currentStep + 1} of {quizData.length}</span>
                    <div className="progress-track">
                        <motion.div
                            className="progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentStep + 1) / quizData.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="glass-card quiz-card"
                >
                    <h2 className="question-text">{currentQuestion.question}</h2>
                    <div className="options-grid">
                        {currentQuestion.options.map((option, index) => {
                            let className = "option-btn";
                            if (isAnswered) {
                                if (index === currentQuestion.answer) className += " correct";
                                else if (index === selectedOption) className += " incorrect";
                                else className += " disabled";
                            } else if (selectedOption === index) {
                                className += " selected";
                            }

                            return (
                                <button
                                    key={index}
                                    className={className}
                                    onClick={() => handleOptionClick(index)}
                                    disabled={isAnswered}
                                >
                                    <span className="option-label">{String.fromCharCode(65 + index)}</span>
                                    <span className="option-text">{option}</span>
                                    {isAnswered && index === currentQuestion.answer && (
                                        <CheckCircle2 size={20} className="icon-status" />
                                    )}
                                    {isAnswered && index === selectedOption && index !== currentQuestion.answer && (
                                        <XCircle size={20} className="icon-status" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="quiz-footer">
                        {isAnswered && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <button className="btn-primary" onClick={nextQuestion}>
                                    {currentStep === quizData.length - 1 ? 'Finish Quiz' : 'Next Question'}
                                    <ChevronRight size={18} />
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
};

export default QuizPage;
