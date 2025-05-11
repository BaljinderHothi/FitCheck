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
   name: str
   worth_it: str
   review: str
   rating: int
   meta: dict


def store_review(data):
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
   if not (1 <= review_request.rating <= 5):
       raise HTTPException(status_code=400, detail="Star ratings must be from 1 to 5.")
   raw_sentiments = sentiment_pipeline(review_request.review)
   sentiments = raw_sentiments[0]
   sentiment = {
       "label": label_mapping.get(sentiments["label"], sentiments["label"]),
       "score": round(sentiments["score"], 4)
   }
   created_at = datetime.now().isoformat()
   data = {
       "name": review_request.name,
       "worth_it": review_request.worth_it,
       "review": review_request.review,
       "rating": review_request.rating,
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
   uvicorn.run(app, host="0.0.0.0", port=8000)
