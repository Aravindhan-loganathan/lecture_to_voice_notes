from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import uuid
from graph import transcribe_audio, build_graph

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

lecture_graph = build_graph()

def parse_summary(summary_str):
    lines = summary_str.strip().split('\n')
    return [line.lstrip('- ').strip() for line in lines if line.strip()]

def parse_flashcards(flashcards_str):
    cards = []
    lines = flashcards_str.strip().split('\n')
    current_q = None
    for line in lines:
        line = line.strip()
        if not line: continue
        if line.upper().startswith('Q'):
            current_q = line.split(':', 1)[1].strip() if ':' in line else line[3:].strip()
        elif line.upper().startswith('A') and current_q:
            answer = line.split(':', 1)[1].strip() if ':' in line else line[3:].strip()
            cards.append({"q": current_q, "a": answer})
            current_q = None
    return cards

def parse_quiz(quiz_str):
    questions = []
    # Split by double newline or pattern like "1."
    blocks = quiz_str.strip().split('\n\n')
    for block in blocks:
        lines = [l.strip() for l in block.strip().split('\n') if l.strip()]
        if len(lines) < 6: continue
        
        try:
            # Q1. or 1.
            q_line = lines[0]
            q_text = q_line.split('.', 1)[1].strip() if '.' in q_line else q_line
            
            options = []
            for i in range(1, 5):
                opt_line = lines[i]
                opt_text = opt_line.split('.', 1)[1].strip() if '.' in opt_line else opt_line
                options.append(opt_text)
            
            ans_line = lines[5]
            answer_letter = ans_line.split(':', 1)[1].strip().upper() if ':' in ans_line else ans_line[-1].upper()
            answer_index = ord(answer_letter) - ord('A')
            
            questions.append({
                "question": q_text,
                "options": options,
                "answer": answer_index
            })
        except Exception as e:
            print(f"Error parsing quiz block: {e}")
            continue
    return questions

@app.post("/process_lecture")
async def process_lecture(file: UploadFile = File(...)):
    if not file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    file_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_extension}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # 1. Transcribe
        print(f"Transcribing {file.filename}...")
        transcript = transcribe_audio(file_path)
        
        # 2. Run Graph
        print("Running AI analysis...")
        result = lecture_graph.invoke({
            "transcript": transcript,
            "summary": "",
            "flashcards": "",
            "quiz": ""
        })
        
        # 3. Parse and return
        return {
            "transcript": transcript,
            "summary": parse_summary(result["summary"]),
            "flashcards": parse_flashcards(result["flashcards"]),
            "quiz": parse_quiz(result["quiz"])
        }
    except Exception as e:
        error_msg = str(e)
        print(f"Error processing lecture: {error_msg}")
        
        if "RESOURCE_EXHAUSTED" in error_msg:
            raise HTTPException(
                status_code=429, 
                detail="AI Quota Exceeded. The free tier limit has been reached. Please wait a minute and try again."
            )
            
        raise HTTPException(status_code=500, detail=error_msg)
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

from pydantic import BaseModel

class ChatRequest(BaseModel):
    transcript: str
    question: str

@app.post("/chat")
async def chat_with_lecture(request: ChatRequest):
    try:
        prompt = f"""
        You are a helpful classroom assistant. You have access to the transcript of the lecture.
        Your task is to answer the user's question based ONLY on the provided transcript.
        
        CRITICAL: Detect the language of the transcript and respond EXCLUSIVELY in that same language.
        If the transcript is in Tamil, answer in Tamil. If Hindi, answer in Hindi.
        
        If the answer is not in the transcript, politely say you don't know based on the lecture content.
        
        Transcript:
        {request.transcript}
        
        User Question:
        {request.question}
        """
        
        # We can reuse the gemini_llm from graph.py but it's easier to just import build_graph and use it? 
        # Actually server.py already has access to graph functions if we import them.
        # Let's import gemini_llm from graph.py
        from graph import gemini_llm
        
        response = gemini_llm(prompt)
        return {"response": response}
    except Exception as e:
        error_msg = str(e)
        print(f"Chat error: {error_msg}")
        
        if "RESOURCE_EXHAUSTED" in error_msg:
            return {"response": "I'm sorry, I've reached my AI limit for the moment. Please wait about 30 seconds before asking another question!"}
            
        raise HTTPException(status_code=500, detail=error_msg)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
