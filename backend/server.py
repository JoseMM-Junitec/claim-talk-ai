from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import shutil
import os
from pathlib import Path
import tempfile

# Import the main pipeline from your existing code
from main import main_pipeline

app = FastAPI(title="Insurance Claim Assistant API")

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173", "*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create temporary directories for file storage
TEMP_DIR = Path("temp_files")
TEMP_DIR.mkdir(exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Insurance Claim Assistant API is running"}

@app.post("/run_pipeline")
async def run_pipeline(
    phone: str = Form(...),
    audio: UploadFile = File(...)
):
    """
    Endpoint to run the main pipeline with phone number and audio file.
    
    Parameters:
    - phone: Phone number as string
    - audio: WAV audio file from frontend recording
    """
    temp_audio_path = None
    
    try:
        # Validate phone number
        if not phone or len(phone) < 8:
            raise HTTPException(status_code=400, detail="Invalid phone number")
        
        # Validate audio file
        if not audio.filename.endswith(('.wav', '.mp3')):
            raise HTTPException(status_code=400, detail="Only WAV or MP3 files are supported")
        
        # Save uploaded audio file temporarily
        temp_audio_path = TEMP_DIR / f"recording_{phone}_{audio.filename}"
        with temp_audio_path.open("wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        
        # Run the pipeline from your existing code
        # The main_pipeline function expects a file path and phone number
        with open(temp_audio_path, "rb") as audio_file:
            main_pipeline(audio_file, phone)
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "message": "Pipeline executed successfully",
                "phone": phone
            }
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Pipeline execution failed: {str(e)}"
        )
    
    finally:
        # Clean up temporary file
        if temp_audio_path and temp_audio_path.exists():
            try:
                os.remove(temp_audio_path)
            except Exception as e:
                print(f"Failed to delete temp file: {e}")

@app.post("/play_audio")
async def play_audio(audio: UploadFile = File(...)):
    """
    Endpoint to receive MP3 from external API and return it for frontend playback.
    
    Parameters:
    - audio: MP3 audio file from external service
    """
    temp_audio_path = None
    
    try:
        # Validate audio file
        if not audio.filename.endswith('.mp3'):
            raise HTTPException(status_code=400, detail="Only MP3 files are supported")
        
        # Save uploaded audio file temporarily
        temp_audio_path = TEMP_DIR / f"playback_{audio.filename}"
        with temp_audio_path.open("wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        
        # Return the file for playback
        return FileResponse(
            temp_audio_path,
            media_type="audio/mpeg",
            filename=audio.filename,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Audio processing failed: {str(e)}"
        )

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up temporary files on shutdown"""
    try:
        shutil.rmtree(TEMP_DIR)
    except Exception as e:
        print(f"Failed to clean up temp directory: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
