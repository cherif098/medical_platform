from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from PIL import Image
import numpy as np
import subprocess
import os

os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# Charger le modèle et le compiler
MODEL_PATH = "modelTB.h5"
model = load_model(MODEL_PATH)
model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])

# Classes définies par le modèle
CLASSES = ["Normal", "Tuberculosis"]

# Fonction de prétraitement d'image
def preprocess_image(image: Image.Image, target_size=(150, 150)):
    image = image.resize(target_size)
    image = img_to_array(image) / 255.0  # Normaliser
    return np.expand_dims(image, axis=0)

# Fonction pour exécuter Ollama
def run_ollama(prompt: str) -> str:
    try:
        process = subprocess.run(
            ["C:\\Users\\aziz\\AppData\\Local\\Programs\\Ollama\\ollama.exe", "run", "llama3.2"],
            input=prompt,
            text=True,
            encoding="utf-8",  
            capture_output=True,
            check=True
        )
        raw_output = process.stdout.strip()
        if raw_output:
            return raw_output
        else:
            return "Erreur : aucune sortie d'Ollama."
    except subprocess.CalledProcessError as e:
        print(f"Erreur lors de l'exécution d'Ollama : {e}")
        return f"Erreur lors de l'exécution : {e.output}"
    except Exception as e:
        print(f"Erreur générale : {e}")
        return str(e)

# Endpoint pour analyser une image
@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        image = Image.open(file.file).convert("RGB")
        processed_image = preprocess_image(image)
        predictions = model.predict(processed_image)
        predicted_class_index = np.argmax(predictions)
        return {
            "class": CLASSES[predicted_class_index],
            "confidence": float(np.max(predictions))
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/ollama_query/")
async def query_ollama(data: dict):
    """
    Interroge Ollama avec les résultats de l'analyse pour des explications détaillées.
    """
    try:
        class_name = data.get("class", "unknown")
        confidence = data.get("confidence", 0)

        prompt = (
        f"La radiographie pulmonaire analysée est classée comme {class_name} avec une confiance de {confidence * 100:.2f}%. "
        "Décrivez en 3 parties sans recommandations : "
        "1. Interprétation radiologique - Décrire les caractéristiques techniques "
        "2. Facteurs différentiels - Causes/risques uniquement si pathologie "
        "3. Valeur diagnostique - Limites et corrélations cliniques nécessaires "
        "Langage strictement technique pour médecin. "
        f"Adaptation obligatoire : {('Aucune mention de pathologie' if class_name == 'normal' else 'Focus sur marqueurs tuberculeux')}."
    )
  
        response = run_ollama(prompt)

        return {"response": response}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/follow_up/")
async def follow_up(data: dict):
    """
    Traite les questions de suivi posées par l'utilisateur à Ollama.
    """
    try:
        user_question = data.get("question", "Aucune question posée.")
        previous_context = data.get("context", "")

        # Vérifier si la question est en lien avec le contexte
        if not any(keyword in user_question.lower() for keyword in previous_context.lower().split()):
            return {"response": "Sorry, I have no clue."}
        prompt = (
            f"{previous_context}\n\nQuestion de suivi : {user_question}\n"
            "Réponds uniquement si la question est en lien direct avec le contexte fourni ci-dessus. "
            "Si la question n'est pas liée au contexte ou à l'analyse précédente, réponds uniquement par : 'Sorry, I have no clue.' "
            "Structure ta réponse de manière concise et professionnelle."
        )

        response = run_ollama(prompt)

        return {"response": response}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
