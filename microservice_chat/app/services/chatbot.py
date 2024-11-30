from typing import List, Iterator
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from ..config.settings import settings
from ..core.models import ChatRequest, ChatResponse
from datetime import datetime
import time

class ChatbotService:
    def __init__(self):
        self.llm = OllamaLLM(
            model=settings.OLLAMA_MODEL,
            temperature=settings.TEMPERATURE
        )
        self.template = """
        Tu es un assistant médical virtuel spécialisé. 
        
        Règles:
        1. Reste dans le contexte médical
        2. Sois précis et professionnel
        3. Renvoie vers un médecin si nécessaire
        4. faire des diagnostics
        5. donner des conseils medicaux
        
        Historique de la conversation:
        {chat_history}
        
        Question actuelle: {question}
        """
        self.prompt = ChatPromptTemplate.from_template(self.template)
    
    def get_response_stream(self, request: ChatRequest) -> Iterator[str]:
        history_text = "\n".join([
            f"{msg.role}: {msg.content}" 
            for msg in request.history
        ]) if request.history else ""
        
        response = self.llm.invoke(
            self.prompt.format(
                chat_history=history_text,
                question=request.message
            )
        )
        
        # Simulation de streaming pour chaque mot
        words = response.split()
        for word in words:
            time.sleep(0.1)  # Ajustez ce délai selon vos besoins
            yield word + " "