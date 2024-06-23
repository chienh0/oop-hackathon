from config import OPENAI_API_KEY
from openai import OpenAI


# Get OpenAI API key from hidden config file
client = OpenAI(api_key=OPENAI_API_KEY)

# Define the path to the audio file
audio_file_path = "audio_clips/ems.m4a"

with open(audio_file_path, "rb") as audio_file:
    transcription = client.audio.transcriptions.create(
        model="whisper-1", 
        file=audio_file)

print(transcription.text)