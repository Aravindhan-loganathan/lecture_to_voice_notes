import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileAudio, CheckCircle2, Loader2, BookText, ListChecks, BrainCircuit, ArrowRight, Download, MessageCircle, X, Send, Mic, Square, FolderOpen } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ClassPage = () => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, processing, completed
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [result, setResult] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);

    const [chatMessages, setChatMessages] = useState([
        { role: 'assistant', content: 'Hi! I am your LectureAI assistant. Ask me anything about this lecture.' }
    ]);
    const [userInput, setUserInput] = useState('');
    const navigate = useNavigate();
    const resultsRef = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const audioFile = new File([audioBlob], `recording_${new Date().getTime()}.wav`, { type: 'audio/wav' });
                processFile(audioFile);

                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingDuration(0);

            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith('audio/')) {
            processFile(droppedFile);
        }
    };

    const onFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const processFile = async (file) => {
        setFile(file);
        setStatus('processing');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8000/process_lecture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const data = response.data;
            setResult({
                transcript: data.transcript,
                summary: data.summary,
                flashcards: data.flashcards
            });

            // Store quiz data for the QuizPage
            localStorage.setItem('lecture_quiz', JSON.stringify(data.quiz));
            setStatus('completed');
        } catch (error) {
            console.error("Error processing lecture:", error);
            alert("Failed to process lecture. Please try again.");
            setStatus('idle');
        }
    };

    const handleExportPDF = () => {
        if (!result) return;

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        let yPos = 25;

        // Draw Border
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.rect(margin - 5, margin - 5, pageWidth - (margin * 2) + 10, pageHeight - (margin * 2) + 10);

        // Header
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(22);
        pdf.setTextColor(109, 40, 217); // Accent color
        pdf.text("LectureAI notes", pageWidth / 2, yPos, { align: "center" });

        yPos += 15;
        pdf.setDrawColor(109, 40, 217);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        // Transcript
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 0);
        pdf.text("Transcript", margin, yPos);
        yPos += 7;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        const splitTranscript = pdf.splitTextToSize(result.transcript, pageWidth - (margin * 2));
        pdf.text(splitTranscript, margin, yPos);
        yPos += (splitTranscript.length * 5) + 10;

        // Summary
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.text("Summary", margin, yPos);
        yPos += 7;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        result.summary.forEach(item => {
            pdf.text(`• ${item}`, margin, yPos);
            yPos += 6;
        });
        yPos += 10;

        // Flashcards
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.text("Flashcards", margin, yPos);
        yPos += 7;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        result.flashcards.forEach(card => {
            if (yPos > pageHeight - 20) {
                pdf.addPage();
                yPos = 20;
                // Redraw border on new page
                pdf.setDrawColor(200, 200, 200);
                pdf.rect(margin - 5, margin - 5, pageWidth - (margin * 2) + 10, pageHeight - (margin * 2) + 10);
            }
            pdf.text(`Q: ${card.q}`, margin, yPos);
            yPos += 5;
            pdf.text(`A: ${card.a}`, margin, yPos);
            yPos += 8;
        });

        pdf.save(`LectureAI_Notes_${new Date().getTime()}.pdf`);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userInput.trim() || !result?.transcript) return;

        const question = userInput;
        const newMessages = [...chatMessages, { role: 'user', content: question }];
        setChatMessages(newMessages);
        setUserInput('');

        try {
            const response = await axios.post('http://localhost:8000/chat', {
                transcript: result.transcript,
                question: question
            });

            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: response.data.response
            }]);
        } catch (error) {
            console.error("Chat error:", error);
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: "Sorry, I encountered an error while analyzing the transcript."
            }]);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="class-page container"
        >
            <div className="page-header">
                <h1>Classroom <span className="text-gradient">Assistant</span></h1>
                <p>Upload your lecture audio to generate study materials</p>
            </div>

            <AnimatePresence mode="wait">
                {status === 'idle' && (
                    <motion.div
                        key="upload"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className={`glass-card upload-area ${isRecording ? 'recording' : ''}`}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        {isRecording ? (
                            <div className="recording-ui">
                                <div className="recording-dot-container">
                                    <div className="recording-dot"></div>
                                    <Mic size={48} className="text-error" />
                                </div>
                                <h2 className="recording-timer">{formatDuration(recordingDuration)}</h2>
                                <p>Recording Live Lecture...</p>
                                <button className="btn-error btn-large" style={{ marginTop: '20px' }} onClick={stopRecording}>
                                    <Square size={20} fill="currentColor" /> Stop Recording
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="upload-icon-container">
                                    <Upload size={48} className="text-primary" />
                                </div>
                                <h2>Drag & Drop Audio</h2>
                                <p>Support for MP3, WAV, M4A</p>
                                <div className="upload-actions">
                                    <label className="btn-primary" style={{ cursor: 'pointer' }}>
                                        <FolderOpen size={20} /> Browse Files
                                        <input type="file" hidden accept="audio/*" onChange={onFileChange} />
                                    </label>
                                    <span className="or-divider">OR</span>
                                    <button className="btn-live" onClick={startRecording}>
                                        <Mic size={20} /> Live Record
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

                {status === 'processing' && (
                    <motion.div
                        key="processing"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.1, opacity: 0 }}
                        className="glass-card processing-card"
                    >
                        <div className="loading-spinner">
                            <Loader2 size={64} className="text-primary animate-spin" />
                        </div>
                        <h2>Processing your lecture...</h2>
                        <p>Our AI is transcribing and summarizing the content.</p>
                        <div className="progress-bar-container">
                            <motion.div
                                className="progress-bar"
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 4, ease: "easeInOut" }}
                            />
                        </div>
                    </motion.div>
                )}

                {status === 'completed' && result && (
                    <motion.div
                        key="results"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="results-container"
                    >
                        <div className="export-actions">
                            <button className="btn-primary" onClick={handleExportPDF}>
                                <Download size={20} /> Export PDF
                            </button>
                        </div>

                        <div ref={resultsRef} className="results-content">
                            <div className="results-grid">
                                {/* Transcript */}
                                <div className="glass-card result-section transcript-section">
                                    <div className="section-title">
                                        <BookText size={20} className="text-primary" />
                                        <h3>Transcript</h3>
                                    </div>
                                    <p className="transcript-text">{result.transcript}</p>
                                </div>

                                {/* Summary */}
                                <div className="glass-card result-section summary-section">
                                    <div className="section-title">
                                        <ListChecks size={20} className="text-secondary" />
                                        <h3>Summary</h3>
                                    </div>
                                    <ul className="summary-list">
                                        {result.summary.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Flashcards */}
                                <div className="glass-card result-section flashcards-section">
                                    <div className="section-title">
                                        <BrainCircuit size={20} className="text-accent" />
                                        <h3>Flashcards</h3>
                                    </div>
                                    <div className="flashcards-list">
                                        {result.flashcards.map((card, i) => (
                                            <div key={i} className="mini-card">
                                                <p className="question"><strong>Q:</strong> {card.q}</p>
                                                <p className="answer"><strong>A:</strong> {card.a}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="actions-footer">
                            <button
                                className="btn-primary btn-large"
                                onClick={() => navigate('/quiz')}
                            >
                                Take Quiz <ArrowRight size={20} />
                            </button>
                        </div>

                        {/* Chatbot Button & Window - Only visible when results are shown */}
                        <div className="chatbot-wrapper">
                            <motion.button
                                className={`chatbot-toggle ${isChatOpen ? 'active' : ''}`}
                                onClick={() => setIsChatOpen(!isChatOpen)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                {isChatOpen ? <X size={24} /> : <MessageCircle size={24} />}
                            </motion.button>

                            <AnimatePresence>
                                {isChatOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                                        className="chatbot-window glass-card"
                                    >
                                        <div className="chatbot-header">
                                            <h3>LectureAI Chat</h3>
                                            <p>Analyze your lecture in real-time</p>
                                        </div>
                                        <div className="chatbot-messages">
                                            {chatMessages.map((msg, i) => (
                                                <div key={i} className={`chat-bubble ${msg.role}`}>
                                                    <p>{msg.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <form className="chatbot-input" onSubmit={handleSendMessage}>
                                            <input
                                                type="text"
                                                placeholder="Ask anything..."
                                                value={userInput}
                                                onChange={(e) => setUserInput(e.target.value)}
                                            />
                                            <button type="submit" className="send-btn">
                                                <Send size={20} />
                                            </button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ClassPage;
