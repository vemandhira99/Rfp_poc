import os
import faiss
import numpy as np
from google import genai
from typing import List
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.core.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

# A simple in-memory store mapping rfp_id -> (FAISS index, chunks)
_vector_stores = {}
_chunk_stores = {}

def get_text_embedding(text: str) -> List[float]:
    """Get embedding vector from Gemini"""
    result = client.models.embed_content(
        model="text-embedding-004",
        contents=text,
        config={
            'task_type': 'RETRIEVAL_DOCUMENT'
        }
    )
    return result.embeddings[0].values

def build_rfp_index(rfp_id: int, text: str):
    """Chunk the RFP text and build a FAISS index"""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1500,
        chunk_overlap=200,
        length_function=len
    )
    chunks = text_splitter.split_text(text)
    
    if not chunks:
        return
        
    embeddings = []
    for chunk in chunks:
        vec = get_text_embedding(chunk)
        embeddings.append(vec)
        
    embeddings_np = np.array(embeddings).astype('float32')
    dim = embeddings_np.shape[1]
    
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings_np)
    
    _vector_stores[rfp_id] = index
    _chunk_stores[rfp_id] = chunks
    print(f"Built FAISS index for RFP {rfp_id} with {len(chunks)} chunks.")

def search_rfp_knowledge(rfp_id: int, query: str, top_k: int = 5) -> str:
    """Retrieve top K relevant chunks for a question"""
    if rfp_id not in _vector_stores or rfp_id not in _chunk_stores:
        return ""
        
    index = _vector_stores[rfp_id]
    chunks = _chunk_stores[rfp_id]
    
    query_vec = get_text_embedding(query)
    query_np = np.array([query_vec]).astype('float32')
    
    distances, indices = index.search(query_np, min(top_k, len(chunks)))
    
    relevant_texts = []
    for idx in indices[0]:
        if idx != -1 and idx < len(chunks):
            relevant_texts.append(chunks[idx])
            
    return "\n...\n".join(relevant_texts)
