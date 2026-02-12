from flask import Flask, request, Response, stream_with_context
from flask_cors import CORS
import ollama
import json

app = Flask(__name__, static_folder="public", static_url_path='')
CORS(app)

#initialize the ollama client
client = ollama.Client(host='http://localhost:11434')

@app.route('/')
def serve_index():
  return app.send_static_file('index.html')

@app.route('/api/chat-stream', methods=['POST'])
def chat_stream():
  try:
    data = request.get_json()
    prompt = data.get('prompt')
    
    #this is a generator funciton that will yield the response from the ollama client as a stream
    def generate():
      try:
        #stream the response from the ollama 
        stream = client.chat(
          model = 'deepseek-r1:7b',
          message=[{'role': 'user','content': prompt}],
          stream=True
        )
        
        for chunk in stream:
          if 'message' in chunk and 'content' in chunk['message']:
            yield chunk['message']['content']
      except Exception as stream_error:
        print(f"Error during streaming:{stream_error}")
        
    return Response(
      stream_with_context(generate()),
      content_type='text/plain'
    )
  except Exception as e:
    print(f"Error in chat_stream endpoint: {e}")

if __name__ == '__main__':
  app.run(host='localhost',debug=False, port=8080)