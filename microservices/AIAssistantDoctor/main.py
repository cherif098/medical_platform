from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from langchain.prompts import SystemMessagePromptTemplate, ChatPromptTemplate, HumanMessagePromptTemplate
import io
import uuid
from datetime import datetime
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

# Stockage global pour les conversations
conversations: Dict[str, dict] = {}

class QuestionRequest(BaseModel):
    question: str
    conversation_id: Optional[str] = None

class ChatHistory(BaseModel):
    id: str
    patient_name: str
    doctor_name: str
    consultation_date: str
    diagnosis: str
    last_message: str
    created_at: str
    updated_at: str

def extract_medical_info(text: str) -> dict:
    patterns = {
        'patient_name': r'Nom\s*:\s*([\w\s]+)(?=\nDate)',
        'consultation_date': r'Date de consultation:\s*([^\n]+)',
        'doctor_name': r'Information du Médecin\s*\nNom:\s*([\w\s]+)',
        'diagnosis': r'Diagnostic principal:\s*([^\n]+)',
        'speciality': r'Spécialité:\s*([^\n]+)'
    }
    
    info = {}
    for key, pattern in patterns.items():
        match = re.search(pattern, text)
        if match:
            info[key] = match.group(1).strip()
        else:
            info[key] = 'Non spécifié'
            
    return info

def get_pdf_text(pdf_files: List[bytes]) -> str:
    text = ""
    for pdf_content in pdf_files:
        pdf_stream = io.BytesIO(pdf_content)
        pdf_reader = PdfReader(pdf_stream)
        for page in pdf_reader.pages:
            text += page.extract_text()
    return text

def get_text_chunks(text: str) -> List[str]:
    text_splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    return text_splitter.split_text(text)

def get_vectorstore(text_chunks: List[str]):
    embeddings = OpenAIEmbeddings()
    return FAISS.from_texts(texts=text_chunks, embedding=embeddings)

def create_conversation_chain(vectorstore):
    general_system_template = """
    You are an intelligent assistant specialized in the medical field. Your role is to support physicians in the detailed analysis of medical reports in PDF format. You are an expert in:

    Interpreting and analyzing textual data contained in medical reports.
    Recognizing medical terminology and explaining it clearly to professionals.
    Generating concise and relevant summaries of reports to facilitate decision-making.
    Identifying critical data requiring special attention (abnormal results, clinical alerts).
    Suggesting best medical practices based on validated protocols and reliable sources.
    Integrating with Electronic Medical Records (EMRs) to enhance analysis and contextualize information.

    You must:

    Respond only to questions related to the content of medical reports or medical practices.
    Always validate your analyses in accordance with current medical guidelines.
    If data is missing, propose strategies to complete the information.
    Limit your scope to analyzing PDF files and provide responses tailored to the needs of physicians.
    ----
    {context}
    ----
    """
    general_user_template = "Question:```{question}```"
    messages = [
        SystemMessagePromptTemplate.from_template(general_system_template),
        HumanMessagePromptTemplate.from_template(general_user_template)
    ]
    qa_prompt = ChatPromptTemplate.from_messages(messages)

    llm = ChatOpenAI(model="gpt-4")
    memory = ConversationBufferMemory(memory_key='chat_history', return_messages=True)
    
    return ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vectorstore.as_retriever(),
        memory=memory,
        combine_docs_chain_kwargs={'prompt': qa_prompt}
    )

@app.post("/upload-documents")
async def upload_documents(files: List[UploadFile] = File(...)):
    global conversations
    
    try:
        pdf_contents = []
        for file in files:
            if not file.filename.endswith('.pdf'):
                raise HTTPException(status_code=400, detail="Only PDF files are accepted")
            content = await file.read()
            pdf_contents.append(content)

        raw_text = get_pdf_text(pdf_contents)
        medical_info = extract_medical_info(raw_text)
        text_chunks = get_text_chunks(raw_text)
        vectorstore = get_vectorstore(text_chunks)
        
        conversation_id = str(uuid.uuid4())
        conversations[conversation_id] = {
            "chain": create_conversation_chain(vectorstore),
            "patient_name": medical_info['patient_name'],
            "doctor_name": medical_info['doctor_name'],
            "consultation_date": medical_info['consultation_date'],
            "diagnosis": medical_info['diagnosis'],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "last_message": "Chat démarré",
            "documents": [file.filename for file in files]
        }

        return {
            "message": "Documents traités avec succès",
            "conversation_id": conversation_id,
            "patient_name": medical_info['patient_name'],
            "doctor_name": medical_info['doctor_name'],
            "consultation_date": medical_info['consultation_date']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/conversations")
async def get_conversations():
    return [
        ChatHistory(
            id=conv_id,
            patient_name=data["patient_name"],
            doctor_name=data["doctor_name"],
            consultation_date=data["consultation_date"],
            diagnosis=data["diagnosis"],
            last_message=data["last_message"],
            created_at=data["created_at"],
            updated_at=data["updated_at"]
        )
        for conv_id, data in conversations.items()
    ]

@app.get("/conversation/{conversation_id}")
async def get_conversation(conversation_id: str):
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation non trouvée")
    
    conv = conversations[conversation_id]
    return {
        "id": conversation_id,
        "patient_name": conv["patient_name"],
        "doctor_name": conv["doctor_name"],
        "consultation_date": conv["consultation_date"],
        "diagnosis": conv["diagnosis"],
        "created_at": conv["created_at"],
        "updated_at": conv["updated_at"],
        "documents": conv["documents"]
    }

@app.post("/ask")
async def ask_question(request: QuestionRequest):
    if not request.conversation_id or request.conversation_id not in conversations:
        raise HTTPException(
            status_code=400,
            detail="ID de conversation invalide ou manquant"
        )
    
    try:
        conversation = conversations[request.conversation_id]
        response = conversation["chain"]({'question': request.question})
        
        # Mise à jour des métadonnées de la conversation
        conversation["updated_at"] = datetime.now().isoformat()
        conversation["last_message"] = request.question[:50] + "..."
        
        return {
            "answer": response['answer'],
            "chat_history": [
                {"role": "user" if i % 2 == 0 else "assistant", "content": msg.content}
                for i, msg in enumerate(response['chat_history'])
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)