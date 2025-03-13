from fastapi import FastAPI, File, UploadFile
import numpy as np
import cv2
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
import io


MODEL_PATH = "model.h5"
model = load_model(MODEL_PATH)

# Paramètres d'image
IMAGE_HEIGHT = 96
IMAGE_WIDTH = 96

CLASS_NAMES = ['Normal', 'Tuberculosis']

app = FastAPI()


@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        # Lire l'image en bytes et la convertir en numpy array 
        contents = await file.read()
        image = np.asarray(bytearray(contents), dtype=np.uint8)
        image = cv2.imdecode(image, cv2.IMREAD_COLOR)
        
        # vérifier si l'image a été chargée correctement
        if image is None:
            return {"error": "Impossible de charger l'image"}

        # prétraitement de l'image
        image = cv2.resize(image, (IMAGE_HEIGHT, IMAGE_WIDTH))
        image = img_to_array(image) / 255.0  # normalisation
        image = np.expand_dims(image, axis=0)  # dimension batch

        # prédiction
        predictions = model.predict(image)
        class_index = np.argmax(predictions, axis=1)[0]
        confidence = float(np.max(predictions))

        return {
            "class": CLASS_NAMES[class_index],
            "confidence": confidence
        }

    except Exception as e:
        return {"error": str(e)}

