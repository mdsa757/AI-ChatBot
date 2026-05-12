# app.py
# Flask backend for the AI Chatbot web application.
# Uses OpenRouter API with the free openai/gpt-oss-120b model.

import os
import json
import requests as http_requests
from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
from dotenv import load_dotenv
from prompts import ACTIVE_PROMPT

load_dotenv()

app = Flask(__name__)
app.secret_key = os.urandom(24)
CORS(app)

# OpenRouter configuration
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = "openai/gpt-oss-120b:free"


@app.route("/", methods=["GET"])
def index():
    """Serve the chat UI. Initialize empty session history if not present."""
    if "history" not in session:
        session["history"] = []
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat_route():
    """Accept user message, build prompt with history, call OpenRouter, return reply."""
    data = request.get_json()
    user_message = data.get("message", "").strip()

    # Server-side input validation
    if not user_message:
        return jsonify({"error": "Please enter a valid message."}), 400

    # Initialize history if not present in session
    if "history" not in session:
        session["history"] = []

    # Append user message to session history
    session["history"].append({"role": "user", "content": user_message})
    session.modified = True

    # Build messages array: system prompt + full conversation history
    messages_to_send = [
        {"role": "system", "content": ACTIVE_PROMPT}
    ] + session["history"]

    try:
        # Read API key from environment at request time
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            return jsonify({"error": "API key not configured. Please set OPENROUTER_API_KEY in .env"}), 500

        # Call OpenRouter API
        response = http_requests.post(
            url=OPENROUTER_API_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            data=json.dumps({
                "model": OPENROUTER_MODEL,
                "messages": messages_to_send,
                "reasoning": {"enabled": True}
            }),
            timeout=60
        )

        response_data = response.json()

        # Handle API-level errors
        if response.status_code == 401:
            return jsonify({"error": "Invalid API key. Please check your configuration."}), 500

        if response.status_code != 200:
            return jsonify({"error": "Something went wrong. Please try again."}), 500

        # Extract the assistant reply
        assistant_message = response_data["choices"][0]["message"]
        assistant_reply = assistant_message.get("content", "")

        # Store the assistant reply in session history
        # Preserve reasoning_details for multi-turn reasoning continuity
        history_entry = {"role": "assistant", "content": assistant_reply}
        reasoning_details = assistant_message.get("reasoning_details")
        if reasoning_details:
            history_entry["reasoning_details"] = reasoning_details

        session["history"].append(history_entry)
        session.modified = True

        return jsonify({"reply": assistant_reply})

    except http_requests.exceptions.Timeout:
        return jsonify({"error": "Request timed out. Please try again."}), 500
    except http_requests.exceptions.ConnectionError:
        return jsonify({"error": "Could not connect to AI service. Please try again."}), 500
    except Exception:
        return jsonify({"error": "Something went wrong. Please try again."}), 500


@app.route("/reset", methods=["POST"])
def reset_route():
    """Clear session conversation history."""
    session["history"] = []
    return jsonify({"status": "Conversation cleared"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
