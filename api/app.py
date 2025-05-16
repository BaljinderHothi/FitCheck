"""
This MVP script only does some basic sentiment analysis on the database
"""


import os
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from supabase import create_client, Client
from datetime import datetime
from dotenv import load_dotenv
from fastapi import Header
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["chrome-extension://feimedmcocmeodonnecchkbdmpdbpebg"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)


tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased-finetuned-sst-2-english")
model = AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased-finetuned-sst-2-english")
#changed these for render storage situations
sentiment_pipeline = pipeline("sentiment-analysis", model=model, tokenizer=tokenizer)


#LABEL_0 -> negative, LABEL_1 -> neutral, LABEL_2 -> positive
label_mapping = {
    "LABEL_0": "negative",
    "LABEL_1": "positive"
}


"""
Here is how the FastAPI code would look for the nedpoint, its a boilerplate that should be edited, this code
is just to simply be used as an example for later connection


app = FastAPI()


@app.post("/analyze-product-review")
def analyze_product_review(review_request: ReviewRequest):
   # Endpoint logic here...
   pass


if __name__ == "__main__":
   import uvicorn
   uvicorn.run(app, host="0.0.0.0", port=8000)
"""



class ReviewRequest(BaseModel):
   name: str
   worth_it: str
   review: str
   rating: int
   meta: dict


def store_review(data):
    try:
        response = supabase.table("sentiment").insert(data).execute()
        if response.data:
            print("Review stored successfully in Supabase!")
        else:
            print(f"Failed to store review. Error: {response.error}")
    except Exception as e:
        print(f"Exception while storing review: {str(e)}")




@app.post("/analyze-product-review")
def analyze_product_review(
    review_request: ReviewRequest,
    authorization: str = Header(None)
):
    print("API called")

    if not (1 <= review_request.rating <= 5):
        raise HTTPException(status_code=400, detail="Star ratings must be from 1 to 5.")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split("Bearer ")[1]
    try:
        user_response = supabase.auth.get_user(token)
        print("User response:", user_response)
        user = user_response.user
        print("User:", user)
    except Exception as e:
        print("Auth error:", str(e))
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    user_email = user.email
    print("User email:", user_email)
    user_lookup = supabase.table("users").select("*").eq("email", user_email).execute()


    if not user_lookup.data or len(user_lookup.data) == 0:
        raise HTTPException(status_code=404, detail="User record not found in user table")

    print("User lookup:", user_lookup.data)

    table_user_id = user_lookup.data[0]["userid"]

    
    print("Table user ID:", table_user_id)

    raw_sentiments = sentiment_pipeline(review_request.review)
    sentiments = raw_sentiments[0]
    sentiment = {
        "label": label_mapping.get(sentiments["label"], sentiments["label"]),
        "score": round(sentiments["score"], 4)
    }

    created_at = datetime.now().isoformat()
    data = {
        "userid": table_user_id,
        "product_name": review_request.name,
        "worth_it": review_request.worth_it,
        "review_text": review_request.review, 
        "star_rating": review_request.rating, 
        "meta": review_request.meta,
        "sentiment_label": sentiment["label"],
        "sentiment_score": sentiment["score"],
        "created_at": created_at
    }


    store_review(data)

    return {
        "message": "Review analyzed and stored",
        "sentiment": sentiment,
        "data": data
    }



if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))  # fallback for local testing
    uvicorn.run(app, host="0.0.0.0", port=port)
