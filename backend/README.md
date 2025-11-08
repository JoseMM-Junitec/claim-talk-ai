# Insurance Claim Assistant - Backend

FastAPI backend for the Insurance Claim Assistant Bot.

## Setup

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Run the server:**
   ```bash
   python server.py
   ```
   
   The server will start at `http://localhost:8000`

## API Endpoints

### POST /run_pipeline
Runs the main claim processing pipeline.

**Parameters:**
- `phone` (form field): Phone number string
- `audio` (file): WAV audio recording

**Response:**
```json
{
  "status": "success",
  "message": "Pipeline executed successfully",
  "phone": "912345678"
}
```

### POST /play_audio
Receives MP3 from external API and returns it for playback.

**Parameters:**
- `audio` (file): MP3 audio file

**Response:**
Returns the MP3 file for browser playback.

## Dependencies

- FastAPI: Web framework
- Uvicorn: ASGI server
- SpeechRecognition: Audio transcription
- OpenSMILE: Audio feature extraction
- scikit-learn: Sentiment analysis ML model
- requests: HTTP requests to external APIs

## Pipeline Flow

1. Frontend sends phone number + WAV recording
2. Backend saves audio temporarily
3. `main_pipeline()` function:
   - Transcribes audio to text
   - Analyzes sentiment/emotion
   - Enriches text with emotion context
   - Sends to external webhook (n8n)
4. Returns success/error response
5. Cleans up temp files

## Configuration

- CORS is configured to allow requests from frontend (localhost:8080, localhost:5173)
- Temporary files are stored in `temp_files/` directory
- Files are automatically cleaned up after processing

## Production Deployment

For production:
1. Update CORS origins in `server.py`
2. Use environment variables for sensitive config
3. Set up proper file storage (not temp directory)
4. Add authentication/rate limiting
5. Use a production ASGI server configuration
