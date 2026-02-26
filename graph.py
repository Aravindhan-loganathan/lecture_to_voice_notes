from typing import TypedDict
from langgraph.graph import StateGraph, END
import os
import time
import google.generativeai as genai

# ----------------------------
# 1️⃣ Gemini Configuration
# ----------------------------

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found.")

genai.configure(api_key=API_KEY)

MODEL_NAME = "gemini-2.5-flash"  # Keep user's chosen model

def gemini_llm(prompt: str) -> str:
    """Helper for text-to-text calls."""
    model = genai.GenerativeModel(MODEL_NAME)
    response = model.generate_content(prompt)
    return response.text

def transcribe_audio(audio_path: str) -> str:
    """Transcribes audio using Gemini File API."""
    print(f"Transcribing {audio_path} via Gemini...")
    
    # Upload to Gemini File API
    audio_file = genai.upload_file(path=audio_path)
    
    # Wait for processing to complete
    for _ in range(30): # Timeout after 30 seconds
        if audio_file.state.name != "PROCESSING":
            break
        time.sleep(1)
        audio_file = genai.get_file(audio_file.name)
        
    if audio_file.state.name == "FAILED":
        raise ValueError(f"Gemini audio processing failed: {audio_file.state.name}")

    model = genai.GenerativeModel(MODEL_NAME)
    response = model.generate_content([
        "Please transcribe this audio exactly as it is spoken. Do not add any commentary or summaries. Output only the transcript text.",
        audio_file
    ])
    
    # Cleanup file from Gemini storage
    try:
        genai.delete_file(audio_file.name)
    except Exception as e:
        print(f"Warning: Failed to delete remote file {audio_file.name}: {e}")
        
    return response.text

# ----------------------------
# 2️⃣ Define Shared State
# ----------------------------

class LectureState(TypedDict):
    transcript: str
    summary: str
    flashcards: str
    quiz: str


# ----------------------------
# 4️⃣ Graph Nodes
# ----------------------------

def summarize_node(state: LectureState):
    transcript = state["transcript"]

    summary = gemini_llm(
        f"""
You are a lecture summarization assistant.

Important rules:
- Use ONLY the information present in the transcript.
- Do NOT add external knowledge.
- Do NOT use bold or markdown formatting.
- CRITICAL: Detect the language of the transcript and respond EXCLUSIVELY in that same language.
- Maintain the SAME language as the transcript for all bullet points.
- Return plain bullet points using "-" only.

Transcript:
{transcript}
"""
    )

    return {"summary": summary}


def flashcard_node(state: LectureState):
    summary = state["summary"]

    flashcards = gemini_llm(
    f"""
Generate 5 flashcards from the summary.

Rules:
- Use ONLY the summary content.
- CRITICAL: Maintain the EXACT SAME language as the summary. If summary is in Tamil, generate Tamil flashcards. If Hindi, generate Hindi.
- Do NOT use markdown or bold.
- Format strictly:

Q1: question
A1: answer

Generate exactly 5.

Summary:
{summary}
"""
)

    return {"flashcards": flashcards}


def quiz_node(state: LectureState):
    summary = state["summary"]

    quiz = gemini_llm(
    f"""
Generate 5 MCQs from the summary.

Rules:
- Use ONLY the summary content.
- CRITICAL: Maintain the EXACT SAME language as the summary for both questions and options.
- Do NOT add external knowledge.
- Do NOT use markdown formatting.
- Format:

1. Question
A. option
B. option
C. option
D. option
Answer: correct_letter

Generate exactly 5.

Summary:
{summary}
"""
)
    return {"quiz": quiz}


# ----------------------------
# 5️⃣ Build LangGraph
# ----------------------------

def build_graph():
    graph = StateGraph(LectureState)

    graph.add_node("summarize", summarize_node)
    graph.add_node("flashcards", flashcard_node)
    graph.add_node("quiz", quiz_node)

    graph.set_entry_point("summarize")

    graph.add_edge("summarize", "flashcards")
    graph.add_edge("flashcards", "quiz")
    graph.add_edge("quiz", END)

    return graph.compile()




