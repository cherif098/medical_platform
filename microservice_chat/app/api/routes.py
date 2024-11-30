from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from ..core.models import ChatRequest, ChatResponse
from ..services.chatbot import ChatbotService

router = APIRouter()
chatbot_service = ChatbotService()

async def stream_response(response_stream):
    for token in response_stream:
        yield f"data: {token}\n\n"

@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        response_stream = chatbot_service.get_response_stream(request)
        return StreamingResponse(
            stream_response(response_stream),
            media_type="text/event-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))