


import os
from app.RAG.Ingestor import RAG, VectorStore
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain_openai import OpenAI
def get_relevalant_chunks(query: str):
    chunks = RAG(query).ingest()
    embeddings = OpenAIEmbeddings(model_name="models/embedding-001", api_key=os.environ["OPENAI_API_KEY"])
    db = FAISS.load_local("uploaded_pdf_faiss_index", embeddings, allow_dangerous_deserialization=True)
    vector_store = VectorStore("stuff").FAISSVectorStore(chunks, embeddings)
    retrived_content = db.similarity_search(query)
    chain = RetrievalQA.from_chain_type(llm=OpenAI(model="gpt-3.5-turbo"), chain_type="stuff", retriever=vector_store.as_retriever())
    response = chain({"input_documents": retrived_content, "question": query}, return_only_outputs=True)
    doc = response["output_text"]
    return doc


