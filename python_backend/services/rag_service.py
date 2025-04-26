from RAG.Ingestor import RAG

class RAGService:
    def __init__(self):
        self.rag = RAG()

    def ingest(self, data):
        
        self.rag.set_file_path(data)
        return self.rag.ingest()


    def retrieve(self, query: str):
        
        return self.rag.get_relevalant_chunks(query)
