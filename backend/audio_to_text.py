import requests
import speech_recognition as sr

def transcribe_audio(file):
    try:
        # Create recognizer instance
        r = sr.Recognizer()

        # Use the file object directly
        with sr.AudioFile(file) as source:
            audio = r.record(source)
            # Language set to en-UK; change if needed
            transcript_text = r.recognize_google(audio, language="en-UK")

        print("Transcription complete.\n")
        return transcript_text

    except Exception as e:
        print("Transcription failed:", e)
        return None


# Example usage:
# transcribe_audio("audio_data/example.wav")
