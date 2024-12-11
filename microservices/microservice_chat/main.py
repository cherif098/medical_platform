from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from openai import OpenAI
import os
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

app = FastAPI()

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modèle de données pour la requête
class ChatRequest(BaseModel):
    message: str
    history: List[dict]
    user_id: str

# Configuration OpenAI
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

# Prompt système optimisé pour la médecine
MEDICAL_SYSTEM_PROMPT = """Vous êtes un assistant médical AI hautement qualifié. Votre rôle est de :
1. Fournir des informations médicales précises et à jour
2. Répondre exclusivement aux questions liées à la médecine
3. Toujours inclure des avertissements appropriés
4. Recommander de consulter un professionnel de santé pour des diagnostics spécifiques
5. Ne pas prescrire de médicaments
6. Utiliser un langage clair et accessible

Pour toute question non médicale, vous devez rediriger poliment vers des ressources appropriées.
"""

async def generate_stream_response(messages):
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=messages,
            temperature=0.7,
            stream=True
        )

        for chunk in response:
            if chunk.choices[0].delta.content is not None:
                # Envoyer le contenu directement sans préfixe "data:"
                yield chunk.choices[0].delta.content

    except Exception as e:
        yield f"Une erreur s'est produite: {str(e)}"

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        # Préparation des messages avec le prompt système
        messages = [{"role": "system", "content": MEDICAL_SYSTEM_PROMPT}]
        
        # Ajouter l'historique des messages
        messages.extend(request.history)
        
        # Ajouter le nouveau message
        messages.append({"role": "user", "content": request.message})
        
        return StreamingResponse(
            generate_stream_response(messages),
            media_type="text/plain"  # Changé de text/event-stream à text/plain
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Route de test
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)