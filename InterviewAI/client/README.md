# InterviewAI

AI-powered interview preparation platform designed to help users practice realistic technical interviews, answer questions, receive AI-based evaluations, and track their interview performance.

## 🚀 Project Overview

InterviewAI provides an interactive interview experience where users can:

Create an account and log in
Select an interview configuration
Practice technical interview questions
Answer questions using text/voice interaction
Receive AI-powered evaluation
View scores and feedback
Save interview sessions
Review interview history

## 🛠️ Tech Stack

## Frontend

React

Vite

JavaScript

CSS

React Router

Lucide React

Web Speech API

## Backend

Node.js

Express.js

REST API

## Database & Authentication

Supabase

Supabase Authentication

Supabase Database

## AI

AI provider integration through the backend
OpenRouter-compatible AI model support

## 📁 Project Structure

*InterviewAI/
└── *InterviewAI/
    ├── client/
    │   ├── src/
    │   ├── public/
    │   ├── package.json
    │   └── ...
    │
    ├── server/
    │   ├── routes/
    │   ├── services/
    │   ├── index.js
    │   └── ...
    │
    ├── .env.example
    └── README.md

## ⚙️ Running the Project Locally

## 1. Clone the repository

git clone https://github.com/priyaskale/InterviewAI.git

## 2. Open the project

cd InterviewAI/InterviewAI

## 3. Install dependencies

### For the client:

cd client

npm install

### For the server:

cd ../server

npm install

## 4. Configure environment variables

Create the required .env files using the provided environment-variable examples.

Add your Supabase and AI configuration locally.

Do not commit private API keys or secrets to GitHub.

## ▶️ Run the Application

### Start the backend server:

cd server

npm run dev

### Then start the frontend in another terminal:

cd client

npm run dev

Open the local URL provided by Vite in your browser.

## 🗄️ Supabase

InterviewAI uses Supabase for:

User authentication

User data

Interview records

Interview evaluations

Interview history

Score storage

The application connects to the Supabase project using environment variables configured locally.

## 🤖 AI Interview Features

The AI system is designed to support:

Interview question generation

Answer evaluation

Correctness scoring

Relevance scoring

Clarity scoring

Technical-depth scoring

Overall interview performance

## 🎯 Interview Configuration

Users can configure interviews based on:

Job role

Experience level

Interview type

Difficulty

Number of questions

Interview mode

Example job roles include:

Frontend Developer

Backend Developer

Full Stack Developer

Data Analyst

## 📌 Current Status

InterviewAI is currently maintained as a local development project.

## 🔮 Future Improvements

Possible future improvements include:

Improved AI interview conversations

Better voice interview support

Advanced performance analytics

Resume-based interview generation

More interview categories

Improved interview history

Personalized preparation plans

Production deployment

Enhanced UI/UX

## 👩‍💻 Author

Priya Kale

GitHub: https://github.com/priyaskale
