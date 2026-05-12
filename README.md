# AI Chatbot

A production-ready AI chatbot web application built with Python, Flask, and the OpenRouter API.

## Features

- Clean browser-based chat interface
- Maintains conversation history within a session
- Prompt engineering built in via `prompts.py`
- Mobile responsive (full support below 600px)
- Production ready — deployable to Render.com

## Tech Stack

- Backend: Python + Flask
- Frontend: HTML + CSS + Vanilla JS
- AI: OpenRouter API (openai/gpt-oss-120b:free)

## Local Setup

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate it:
   - Mac/Linux: `source venv/bin/activate`
   - Windows: `venv\Scripts\activate`
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Copy the example env file and add your API key:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and replace `your_openrouter_api_key_here` with your actual key.
6. Run the app:
   ```bash
   python app.py
   ```
7. Open your browser at: `http://localhost:5000`

## Deployment to Render.com

1. Push this repository to GitHub
2. Go to [render.com](https://render.com) and create a new Web Service
3. Connect your GitHub repository
4. Set the build command: `pip install -r requirements.txt`
5. Set the start command: `python app.py`
6. Add the environment variable: `OPENROUTER_API_KEY` = your actual key
7. Deploy

## Prompt Engineering

Edit `prompts.py` to change the AI's behavior and personality.

Change `ACTIVE_PROMPT` to switch modes:
- `"default"` — helpful, concise, honest
- `"formal"` — structured, professional language
- `"casual"` — friendly, conversational tone

```python
ACTIVE_PROMPT = SYSTEM_PROMPTS["casual"]  # switch mode here
```

## File Structure

```
ai-chatbot/
├── app.py              # Flask app, routes, session, OpenRouter
├── prompts.py          # System prompts and active mode
├── requirements.txt    # Python dependencies
├── .env.example        # Template for environment config
├── .gitignore          # Excludes .env and build artifacts
├── README.md           # This file
├── templates/
│   └── index.html      # Chat UI markup
└── static/
    ├── style.css        # All styles, mobile responsive
    └── script.js        # Interactions, fetch calls, DOM updates
```
