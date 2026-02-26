from typing import TypedDict
from langgraph.graph import StateGraph, END
import google.generativeai as genai
import os
from openai import OpenAI
import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found.")

openai_client = OpenAI(api_key=OPENAI_API_KEY)

def transcribe_audio(audio_path: str) -> str:
    with open(audio_path, "rb") as audio_file:
        transcript = openai_client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )
    return transcript.text
# ----------------------------
# 1️⃣ Gemini Configuration
# ----------------------------

# Set your API key here OR use environment variable

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found.")

genai.configure(api_key=API_KEY)

MODEL_NAME = "gemini-2.5-flash"

def gemini_llm(prompt: str) -> str:
    model = genai.GenerativeModel(MODEL_NAME)
    response = model.generate_content(prompt)
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




