import os
import google.generativeai as genai
import time

# Use the same logic as graph.py
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("GEMINI_API_KEY not found in environment.")
    exit(1)

genai.configure(api_key=API_KEY)

# I suspect 2.5-flash is a typo. Let's try 1.5-flash or 2.0-flash.
MODEL_NAME = "gemini-1.5-flash" 

def test_transcribe(audio_path):
    print(f"Uploading {audio_path}...")
    audio_file = genai.upload_file(path=audio_path)
    print(f"File uploaded: {audio_file.name}")
    
    # Wait for file to be processed if needed (usually fast for small files)
    while audio_file.state.name == "PROCESSING":
        print("Processing...")
        time.sleep(2)
        audio_file = genai.get_file(audio_file.name)
    
    if audio_file.state.name == "FAILED":
        raise ValueError(f"Audio file processing failed: {audio_file.state.name}")

    print("Transcribing...")
    model = genai.GenerativeModel(MODEL_NAME)
    response = model.generate_content([
        "Please transcribe this audio exactly as it is spoken. Do not add any commentary.",
        audio_file
    ])
    
    # Clean up the file from Gemini storage
    genai.delete_file(audio_file.name)
    
    return response.text

if __name__ == "__main__":
    try:
        text = test_transcribe("sample_audio.mp3")
        print("--- TRANSCRIPT ---")
        print(text)
    except Exception as e:
        print(f"Error: {e}")
