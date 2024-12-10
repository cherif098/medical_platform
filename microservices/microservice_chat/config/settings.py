from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Medical Chatbot"
    DEBUG: bool = True
    OLLAMA_MODEL: str = "mistral"
    TEMPERATURE: float = 0.7
    MAX_TOKENS: int = 2000
    
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",  
        "http://127.0.0.1:5174"
    ]
    
settings = Settings()