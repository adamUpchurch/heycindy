from flask import Flask, request, render_template, jsonify
import json
from sentiment  import followPeople
app = Flask(__name__)

@app.route('/follow_tweeter_by_phrase', methods=['POST'])
def hello_world():
    data = json.loads(request.data)
    return jsonify(followPeople(data['phrase']))