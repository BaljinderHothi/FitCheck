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
load_dotenv()
app = FastAPI()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

tokenizer = AutoTokenizer.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment")
model = AutoModelForSequenceClassification.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment")
sentiment_pipeline = pipeline("sentiment-analysis", model=model, tokenizer=tokenizer)

#LABEL_0 -> negative, LABEL_1 -> neutral, LABEL_2 -> positive
label_mapping = {
    "LABEL_0": "negative",
    "LABEL_1": "neutral",
    "LABEL_2": "positive"
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
    star_rating: int
    review_text: str

def store_review(star_rating, review_text, sentiments):
    created_at = datetime.now().isoformat() 
    data = {
        "star_rating": star_rating,
        "review_text": review_text,
        "sentiment_label": sentiments[0]["label"],
        "sentiment_score": sentiments[0]["score"],
        "created_at": created_at
    }
    try:
        response = supabase.table("sentiment").insert(data).execute()
        if response.status_code == 201:
            print("Review stored successfully in Supabase!")
        else:
            print(f"Failed to store review in Supabase:{response.status_code}")
    except Exception as e:
        print(f"Error while storing review in Supabase:{str(e)}")

@app.post("/analyze-product-review")
def analyze_product_review(review_request: ReviewRequest):
    print("Api called")
    star_rating = review_request.star_rating
    review_text = review_request.review_text
    if not (1 <= star_rating <= 5):
        raise HTTPException(status_code=400, detail="Star ratings must be from 1 to 5.")
    raw_sentiments = sentiment_pipeline(review_text)
    sentiments = []
    for res in raw_sentiments:
        mapped_label = label_mapping.get(res["label"], res["label"])
        sentiments.append({"label": mapped_label, "score": round(res["score"], 4)})
    store_review(star_rating, review_text, sentiments)
    return {
        "star_rating": star_rating,
        "review_text": review_text,
        "sentiment": sentiments
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
