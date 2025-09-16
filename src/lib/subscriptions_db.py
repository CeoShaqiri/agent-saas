import chromadb
from chromadb.config import Settings

client = chromadb.Client(Settings())
collection = client.get_or_create_collection("subscribers")

def add_subscriber(user_id: str, email: str, stripe_customer_id: str, status: str):
    collection.add(
        documents=[f"User {user_id} ({email}) subscription status: {status}"],
        ids=[user_id],
        metadatas=[{"email": email, "stripe_customer_id": stripe_customer_id, "status": status}]
    )

def get_subscriber(user_id: str):
    result = collection.get(ids=[user_id])
    return result

def list_subscribers():
    return collection.get()

def update_subscriber_status(user_id: str, status: str):
    sub = get_subscriber(user_id)
    if sub:
        collection.update(ids=[user_id], metadatas=[{"status": status}])
