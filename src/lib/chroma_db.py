import chromadb
from chromadb.config import Settings

# Initialize Chroma client (local, persistent)
client = chromadb.Client(Settings(persist_directory=".chroma_data"))

# Create or get a collection for agent Q&A
collection = client.get_or_create_collection(name="agent_qa")

def add_qa(question: str, answer: str, agent: str, user_id: str = None):
    metadata = {"agent": agent}
    if user_id:
        metadata["user_id"] = user_id
    collection.add(
        documents=[answer],
        metadatas=[metadata],
        ids=[question],
    )

def query_qa(query: str, agent: str = None, top_k: int = 3):
    where = {"agent": agent} if agent else {}
    results = collection.query(query_texts=[query], n_results=top_k, where=where)
    return results
