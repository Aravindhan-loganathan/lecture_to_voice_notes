# 🎓 LectureAI – Classroom Assistant

LectureAI is a full-stack AI-powered classroom assistant that:

- 🎙 Transcribes lecture audio
- 📝 Generates structured summaries
- 🧠 Creates flashcards
- ❓ Generates MCQ quizzes
- 💬 Supports lecture-based Q&A chat

---

## 🚀 Tech Stack

### Backend
- FastAPI
- LangGraph
- HuggingFace Whisper (for transcription) – installed via the `openai-whisper` package
- Google Generative AI (Gemini) as the LLM backend
- OpenAI client (optional, not currently used but kept for future extensions)

### Frontend
- React
- Axios
- Framer Motion
- jsPDF

---

# 🛠️ Setup Instructions

---

## 1️⃣ Clone Repository

```bash
git clone <your-repo-url>
cd lecture_to_voice_notes

### Backend Setup

1. **Create a virtual environment**

```bash
python -m venv .venv
```

2. **Activate the environment**

Windows:
```powershell
.venv\Scripts\activate
```

macOS / Linux:
```bash
source .venv/bin/activate
```

3. **Install dependencies**

```bash
pip install -r requirements.txt
```

The requirements file includes every needed package (FastAPI, LangGraph, google-generativeai, openai-whisper, python-dotenv, requests, etc.).

If the file is missing or you prefer manual installation:

```bash
pip install fastapi uvicorn langgraph requests python-dotenv openai-whisper google-generativeai
```

4. **Add environment variables**

Create a `.env` file in the backend root (the server code uses python-dotenv to load it):

```
GEMINI_API_KEY=your_gemini_api_key
# any other variables can go here, for example:
# OPENAI_API_KEY=your_openai_key
```

Or set the variable in the system environment:

```powershell
setx GEMINI_API_KEY "your_gemini_api_key"
```

Restart your terminal for the change to take effect.

> 💡 The backend will automatically load `.env` when `python-dotenv` is installed, so make sure the package is included in your environment.

Step D – Run Backend

```bash
python server.py
```

The backend will start at:

```
http://localhost:8000
```

Swagger docs are available at:

```
http://localhost:8000/docs
```

---

3️⃣ **Frontend Setup**

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```
VITE_API_URL=http://localhost:8000
```

Start the frontend development server:

```bash
npm run dev
```

The app will be available at:

```
http://localhost:5173
```