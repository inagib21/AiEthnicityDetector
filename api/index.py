import torch
import torchvision
import torch.nn as nn
import dlib
import cv2
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import os
from torchvision import transforms
from datetime import datetime
import json

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path setup
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FAIRFACE_DIR = os.path.join(BASE_DIR, 'FairFace')
MODEL_PATH = os.path.join(FAIRFACE_DIR, 'fair_face_models', 'fairface_alldata_20191111.pt')
FACE_DETECTOR_PATH = os.path.join(FAIRFACE_DIR, 'dlib_models', 'mmod_human_face_detector.dat')
SHAPE_PREDICTOR_PATH = os.path.join(FAIRFACE_DIR, 'dlib_models', 'shape_predictor_5_face_landmarks.dat')

print(f"Model paths:")
print(f"FairFace model: {MODEL_PATH}")
print(f"Face detector: {FACE_DETECTOR_PATH}")
print(f"Shape predictor: {SHAPE_PREDICTOR_PATH}")

def init_models():
    try:
        device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
        print(f"Using device: {device}")

        print("Loading FairFace model...")
        model_fair_7 = torchvision.models.resnet34(pretrained=True)
        model_fair_7.fc = nn.Linear(model_fair_7.fc.in_features, 18)
        model_fair_7.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        model_fair_7 = model_fair_7.to(device)
        model_fair_7.eval()

        print("Loading face detector...")
        cnn_face_detector = dlib.cnn_face_detection_model_v1(FACE_DETECTOR_PATH)
        print("Loading shape predictor...")
        sp = dlib.shape_predictor(SHAPE_PREDICTOR_PATH)

        print("All models loaded successfully!")
        return model_fair_7, cnn_face_detector, sp, device
    except Exception as e:
        print(f"Error initializing models: {str(e)}")
        raise

try:
    model_fair_7, face_detector, shape_predictor, device = init_models()
except Exception as e:
    print(f"Failed to initialize models: {str(e)}")
    raise

# Create albums directory
ALBUMS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'albums')
os.makedirs(ALBUMS_DIR, exist_ok=True)

# Image transformation pipeline
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def detect_and_align_face(img):
    try:
        print("Detecting faces...")
        dets = face_detector(img, 1)
        if len(dets) == 0:
            raise ValueError("No face detected in image")

        print(f"Found {len(dets)} faces")
        faces = dlib.full_object_detections()
        faces.append(shape_predictor(img, dets[0].rect))
        
        print("Aligning face...")
        images = dlib.get_face_chips(img, faces, size=300, padding=0.25)
        if not images:
            raise ValueError("Failed to align detected face")

        print("Face aligned successfully")
        return Image.fromarray(images[0])

    except Exception as e:
        print(f"Error in face detection/alignment: {str(e)}")
        raise

def predict_age_gender_race(face_img, device):
    try:
        print("Preparing image for prediction...")
        face_tensor = transform(face_img).unsqueeze(0).to(device)

        print("Running model inference...")
        with torch.no_grad():
            outputs = model_fair_7(face_tensor)
            outputs = outputs.cpu().numpy().squeeze()

        race_outputs = outputs[:7]
        gender_outputs = outputs[7:9]
        age_outputs = outputs[9:18]

        race_score = np.exp(race_outputs) / np.sum(np.exp(race_outputs))
        gender_score = np.exp(gender_outputs) / np.sum(np.exp(gender_outputs))
        age_score = np.exp(age_outputs) / np.sum(np.exp(age_outputs))

        race_map = {
            0: 'White', 1: 'Black', 2: 'Hispanic', 3: 'East Asian',
            4: 'Southeast Asian', 5: 'Indian', 6: 'Middle Eastern'
        }

        age_map = {
            0: '0-2', 1: '3-9', 2: '10-19', 3: '20-29',
            4: '30-39', 5: '40-49', 6: '50-59', 7: '60-69', 8: '70+'
        }

        predictions = {
            "race": race_map[np.argmax(race_score)],
            "race_probs": {race_map[i]: float(score) for i, score in enumerate(race_score)},
            "gender": "Female" if np.argmax(gender_score) == 1 else "Male",
            "gender_prob": float(gender_score[np.argmax(gender_score)]),
            "age": age_map[np.argmax(age_score)],
            "age_prob": float(age_score[np.argmax(age_score)])
        }

        print("Predictions generated successfully")
        return predictions

    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        raise

@app.get("/api/py/health")
async def health_check():
    return {
        "status": "healthy",
        "models_loaded": True,
        "device": str(device),
        "albums_dir": ALBUMS_DIR
    }

@app.post("/api/py/analyze-face")
async def analyze_face(file: UploadFile = File(...)):
    temp_file_path = None
    try:
        print(f"Processing file: {file.filename}")
        
        # Read file and check size first
        contents = await file.read()
        file_size = len(contents)
        
        # Add size check (e.g., 10MB limit)
        if file_size > 10 * 1024 * 1024:  # 10MB
            raise HTTPException(
                status_code=413,
                detail="File too large. Maximum size is 10MB"
            )

        # Convert to numpy array
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Free the contents from memory
        del contents
        del nparr
            
        # Convert BGR to RGB
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        print("Image loaded successfully")

        # Detect and align face
        face_img = detect_and_align_face(img)
        print("Face detected and aligned")

        # Free the original image from memory
        del img

        # Get predictions
        predictions = predict_age_gender_race(face_img, device)
        print("Predictions generated")

        # Save the aligned face
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        save_path = os.path.join(ALBUMS_DIR, f"aligned_{timestamp}.jpg")
        face_img.save(save_path)
        print(f"Saved aligned face to {save_path}")

        # Clear the face image from memory
        del face_img

        return predictions

    except ValueError as ve:
        print(f"Validation error: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Force garbage collection
        import gc
        gc.collect()
        
        # Make sure file is closed
        await file.close()

@app.post("/api/py/cleanup")
async def cleanup_memory():
    """Emergency cleanup endpoint"""
    try:
        import gc
        gc.collect()
        torch.cuda.empty_cache()  # If using CUDA
        return {"status": "success", "message": "Memory cleaned up"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/py/save-analysis")
async def save_analysis(data: dict):
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_path = os.path.join(ALBUMS_DIR, f"analysis_{timestamp}")

        # Save predictions
        with open(f"{base_path}_predictions.json", "w") as f:
            json.dump(data["predictions"], f, indent=2)

        return {"status": "success", "message": "Analysis saved successfully"}
    except Exception as e:
        print(f"Error in save_analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

