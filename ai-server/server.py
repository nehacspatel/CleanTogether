# # server.py
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import openai
# import os
# from dotenv import load_dotenv

# # Load environment variables from .env
# load_dotenv()

# # Set the OpenAI API key
# openai.api_key = os.getenv("OPENAI_API_KEY")

# # Initialize Flask app
# app = Flask(__name__)
# CORS(app)

# @app.route("/")
# def home():
#     return "✅ AI Chatbot server is running!"

# @app.route("/api/chat", methods=["POST"])
# def chat():
#     data = request.get_json()
#     user_message = data.get("message")

#     if not user_message:
#         return jsonify({"error": "No message provided"}), 400

#     try:
#         response = openai.ChatCompletion.create(
#             model="gpt-3.5-turbo",  # Change to "gpt-4" if you have access
#             messages=[
#                 {
#                     "role": "system",
#                     "content": "You are a helpful assistant for environmental awareness and beach cleaning."
#                 },
#                 {"role": "user", "content": user_message}
#             ],
#             temperature=0.7,
#             max_tokens=150
#         )
#         bot_reply = response['choices'][0]['message']['content'].strip()
#         return jsonify({"response": bot_reply})
#     except Exception as e:
#         print("Error:", e)
#         return jsonify({"error": "Something went wrong"}), 500

# if __name__ == "__main__":
#     app.run(port=5001)

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "✅ AI Chatbot server is running!"

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message")

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    # Dummy reply for UI testing
    bot_reply = f"You said: '{user_message}'. This is a dummy AI response for now!"
    return jsonify({"reply": bot_reply})

if __name__ == "__main__":
    app.run(port=5001)
