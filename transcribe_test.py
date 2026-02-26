import whisper

model = whisper.load_model("base")  # small, fast model

result = model.transcribe("sample_audio.mp3")

print("Transcript:")
print(result["text"])