# LectureAI - Transform Lectures into Knowledge 

LectureAI is an advanced, AI-powered educational platform that helps students and professionals convert audio recordings of lectures or meetings into actionable study materials. By leveraging state-of-the-art AI models, it automates the process of note-taking, summarization, and self-testing.

##  Key Features

-   Live Audio Recording: Capture lectures in real-time directly through the browser.
-   Audio Transcription: High-accuracy speech-to-text conversion powered by OpenAI's Whisper.
-   AI Analysis (LangGraph):
    -   Intelligent Summarization: Context-aware bullet points extracted from the transcript.
    -   Automatic Flashcards: Quiz yourself with AI-generated question-and-answer pairs.
    -   Dynamic Quizzes: Test your knowledge with 5-question multiple-choice quizzes generated specifically for your lecture content.
-   Classroom Chatbot: Discuss your lecture in real-time with an AI assistant that understands the transcript.
-   Export to PDF: One-click download of your study suite (Transcript, Summary, Flashcards) in a beautifully formatted PDF.
-   Universe Theme: A premium, cosmic UI/UX designed with glassmorphism and smooth animations.

##  Tech Stack

### Frontend
-   React (Vite)
-   Framer Motion (Animations)
-   Lucide React (Icons)
-   Axios (API Requests)
-   jsPDF & html2canvas (PDF Generation)
-   Canvas-confetti (Gamification)

### Backend
-   FastAPI (Python Server)
-   LangGraph (AI Workflow Orchestration)
-   Google Gemini 1.5 Flash (Content Generation)
-   OpenAI Whisper (Speech Recognition)

---

## Getting Started

### Prerequisites
-   Python 3.9+
-   Node.js 18+
-   A Google Gemini API Key

### Backend Setup
1.  Navigate to the project root:
    ```bash
    cd lecture-ai
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Set your API Key:
    ```bash
    # Windows PowerShell
    $env:GEMINI_API_KEY = "your_key_here"
    ```
5.  Run the server:
    ```bash
    python server.py
    ```

### Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```

## Project Structure

lecture-ai/
├── frontend/              # React application
│   ├── src/
│   │   ├── assets/        # Images and assets
│   │   ├── components/    # Reusable UI components
│   │   └── pages/         # Page components (Home, Class, Quiz)
├── graph.py               # LangGraph AI logic
├── server.py              # FastAPI Backend
└── uploads/               # Temporary folder for audio processing


