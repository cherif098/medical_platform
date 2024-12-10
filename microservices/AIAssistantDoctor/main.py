# main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
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

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifiez les domaines autorisés
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Charger les variables d'environnement
load_dotenv()

# Stockage global pour la conversation
conversation_chain = None

class QuestionRequest(BaseModel):
    question: str

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
    global conversation_chain
    
    try:
        # Lire le contenu de tous les fichiers PDF
        pdf_contents = []
        for file in files:
            if not file.filename.endswith('.pdf'):
                raise HTTPException(status_code=400, detail="Only PDF files are accepted")
            content = await file.read()
            pdf_contents.append(content)

        # Traiter les PDFs
        raw_text = get_pdf_text(pdf_contents)
        text_chunks = get_text_chunks(raw_text)
        vectorstore = get_vectorstore(text_chunks)
        conversation_chain = create_conversation_chain(vectorstore)

        return {"message": "Documents processed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask")
async def ask_question(request: QuestionRequest):
    global conversation_chain
    
    if not conversation_chain:
        raise HTTPException(
            status_code=400,
            detail="Please upload and process documents first"
        )
    
    try:
        response = conversation_chain({'question': request.question})
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