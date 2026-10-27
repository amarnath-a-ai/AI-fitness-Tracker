from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import config
from routes import prediction, recommendation, chatbot

app = FastAPI(
    title="Athrix Prediction Service",
    description="Machine Learning models & AI Coach for Fitness and Health Tracking",
    version="1.0.0"
)


# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes
app.include_router(prediction.router, prefix="/api", tags=["prediction"])
app.include_router(recommendation.router, prefix="/api", tags=["recommendation"])
app.include_router(chatbot.router, prefix="/api", tags=["chatbot"])

@app.get("/")
def read_root():
    return {"message": "FitAI prediction service is online!"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "environment": config.ENV}
 