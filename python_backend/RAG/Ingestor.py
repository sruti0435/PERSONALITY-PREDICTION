
from enum import Enum
import os
from typing import Optional, Union
import uuid
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.text_splitter import SentenceTransformersTokenTextSplitter
from langchain.text_splitter import CharacterTextSplitter
from PyPDF2 import PdfReader
from langchain_openai import OpenAIEmbeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import AssemblyAIAudioTranscriptLoader
from langchain_community.document_loaders.assemblyai import TranscriptFormat
from langchain.chains import RetrievalQA
from langchain_openai import OpenAI

from dotenv import load_dotenv

load_dotenv()

class Chunker:
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.text_splitter = None
        
    
    def RecursiveCharacterTextSplitter(self):
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        return self
    
    def SentenceTransformersChunker(self):
        self.text_splitter = SentenceTransformersTokenTextSplitter(chunk_size=1000, chunk_overlap=200)
        return self
    
    def CharacterTextSplitter(self):
        self.text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        return self
        
    def chunk_text(self, text: str):
        return self.text_splitter.split_text(text)
    
    

class FileType(Enum):
    PDF = "pdf"
    DOCX = "docx"
    TXT = "txt"
    CSV = "csv"
    EXCEL = "excel"
    JSON = "json"
    AUDIO = "audio"

    
class GetText:
    def __init__(self, file : Optional[str] = None, file_type : Optional[FileType] = None):
        self.file = file
        self.text = ""
        self.type = file_type
        
    def get_text(self):
        return self.text
    
    def get_text_from_file(self):   
        
        if self.type == FileType.PDF:
            self.text = self.get_text_from_pdf(self.file)
        elif self.type == FileType.DOCX:
            self.text = self.get_text_from_docx(self.file)
        elif self.type == FileType.TXT:
            self.text = self.get_text_from_txt(self.file)
        elif self.type == FileType.AUDIO:
            self.text = self.get_text_from_audio(self.file)
            

        return self.text
    
    def get_text_from_audio(self, audio_path: str):
        with open(audio_path, "rb") as file:
            audio_reader = AssemblyAIAudioTranscriptLoader(file, transcript_format=TranscriptFormat.TEXT)
            text = audio_reader.load()
        return text
    
    def get_text_from_pdf(self, pdf_path: str):
        with open(pdf_path, "rb") as file:
            pdf_reader = PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
        return text
    
    def get_text_from_docx(self, docx_path: str):
        #doc = docx.Document(docx_path)  
        text = ""
        # for paragraph in doc.paragraphs:
        #     text += paragraph.text
        return text
    
    def get_text_from_txt(self, txt_path: str): 
        with open(txt_path, "r") as file:
            text = file.read()
        return text
    
    def get_text_from_csv(self, csv_path: str):
        with open(csv_path, "r") as file:
            text = file.read()
        return text
    
    def get_text_from_excel(self, excel_path: str):
        with open(excel_path, "r") as file:
            text = file.read()
        return text
    
    def get_text_from_json(self, json_path: str):
        with open(json_path, "r") as file:
            text = file.read()
        return text
    
import getpass
class Embedder:
    def __init__(self):
        pass
        
    def GoogleEmbedder(self):
        
        embedder = GoogleGenerativeAIEmbeddings(model_name="models/text-embedding-004", google_api_key=os.environ["GOOGLE_API_KEY"])
        return embedder
    
    def OpenAIEmbedder(self):
        embedder = OpenAIEmbeddings(model="text-embedding-3-large", api_key=os.environ["OPENAI_API_KEY"])
        return embedder
    
from langchain_community.vectorstores import FAISS
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain.docstore.document import Document
import faiss
class VectorStore:
    def __init__(self):
        pass
    
    def FAISSVectorStore(self, texts: list[str], embeddings: Embedder):
        
        docs = {}
        for text in texts:
            docs[uuid.uuid4()] = Document(page_content=text)
        faiss_index = faiss.IndexFlatL2(len(embeddings.embed_query(texts[0])))
        vector_store = FAISS(embeddings, faiss_index, InMemoryDocstore(docs), {})
        vector_store.add_documents(documents=docs.values())
        vector_store.save_local("uploaded_pdf_faiss_index")
        return vector_store
    
    def ChromaVectorStore(self, texts: list[str], embeddings: Embedder):
        # Can Be built down the line
        """vector_store = Chroma.from_texts(texts, embedding=embeddings)
        return vector_store"""
        pass
    
    def PineconeVectorStore(self, texts: list[str], embeddings: Embedder):
        # Can Be built down the line
        """vector_store = Pinecone.from_texts(texts, embedding=embeddings)
        return vector_store"""
        pass
    
    def MilvusVectorStore(self, texts: list[str], embeddings: Embedder):
        # Can Be built down the line
        """ vector_store = Milvus.from_texts(texts, embedding=embeddings)
        return vector_store"""
        pass

class RAG:
    def __init__(self):
        self.file_path = None
        
    def set_file_path(self, file_path: str):
        end = file_path.split(".")[-1]
        if end in [".wav", ".mp3", ".mp4", ".m4a"]:
            self.type = FileType.AUDIO
        else:
            for file_type in FileType:
                if end == file_type.value:
                    self.type = file_type
                break
            else:
                raise ValueError("Invalid file type")
        self.file_path = file_path
        
    def ingest(self):
        text = GetText(self.file_path,self.type).get_text_from_file()

        chunks = Chunker().RecursiveCharacterTextSplitter().chunk_text(text)
        embeddings = Embedder().OpenAIEmbedder()
        vector_store = VectorStore().FAISSVectorStore(chunks, embeddings)
    
    
    def get_relevalant_chunks(self,query: str):
        embeddings = OpenAIEmbeddings(model="text-embedding-3-large", api_key=os.environ["OPENAI_API_KEY"])
        db = FAISS.load_local("uploaded_pdf_faiss_index", embeddings, allow_dangerous_deserialization=True)
        #vector_store = VectorStore().FAISSVectorStore(len([query]), embeddings)
        retrived_content = db.similarity_search(query)
        print(retrived_content)
        #chain = RetrievalQA.from_chain_type(llm=OpenAI(model="gpt-3.5-turbo"), chain_type="stuff", retriever=db.as_retriever())
        #response = chain({"input_documents": retrived_content, "query": query}, return_only_outputs=True)
        #doc = response["output_text"]
        return retrived_content[0].page_content

    
