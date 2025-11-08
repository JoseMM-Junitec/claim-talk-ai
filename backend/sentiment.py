import opensmile
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
import joblib
import tempfile
import os

def analyze_sentiment(audio_file):
    """
    Analyze sentiment directly from an audio file object using OpenSMILE feature extraction.
    
    Parameters
    ----------
    audio_file : file-like object
        File-like object containing an audio file (e.g., BytesIO or file opened with open()).

    Returns
    -------
    dict
        Sentiment analysis result: {"sentiment": str, "confidence": float}
    """

    # Save temporary file (OpenSMILE needs a file path)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp.write(audio_file.read())
        tmp_path = tmp.name

    try:
        # Initialize OpenSMILE (using the 'emobase' configuration for emotion features)
        smile = opensmile.Smile(
            feature_set=opensmile.FeatureSet.emobase,
            feature_level=opensmile.FeatureLevel.Functionals,
        )

        # Extract acoustic features
        features = smile.process_file(tmp_path)
        features = features.fillna(0)  # handle NaNs

        # Scale features
        scaler = StandardScaler()
        scaled_features = scaler.fit_transform(features)

        # Load or create model
        model_path = "sentiment_model.pkl"
        if os.path.exists(model_path):
            model = joblib.load(model_path)
        else:
            # Dummy model for demonstration
            X_dummy = np.random.rand(10, scaled_features.shape[1])
            y_dummy = np.random.choice(["positive", "negative", "neutral"], size=10)
            model = LogisticRegression(max_iter=200)
            model.fit(X_dummy, y_dummy)
            joblib.dump(model, model_path)

        # Predict sentiment
        probs = model.predict_proba(scaled_features)[0]
        label = model.classes_[np.argmax(probs)]
        confidence = float(np.max(probs))

        return {"sentiment": label, "confidence": confidence}

    finally:
        # Clean up temporary file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
