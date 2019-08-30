from flask import Flask, request, render_template, jsonify
import json
from twitterAPI  import followPeople, create_friendship, create_favorite, retweet, get_tweets
app = Flask(__name__)

@app.route('/find_tweets_by_phrase', methods=['POST'])
def getting_some_sweet_tweets():
    data = json.loads(request.data)
    return jsonify(get_tweets(data['phrase']))

@app.route('/create_friendship', methods=['POST'])
def follow_new_friend():
    data = json.loads(request.data)
    print(data)
    return create_friendship(data['follower_id'])

@app.route('/create_favorite', methods=['POST'])
def fav_a_tweet():
    data = json.loads(request.data)
    return create_favorite(data['tweet_id'])

@app.route('/create_retweet', methods=['POST'])
def re_tweet():
    data = json.loads(request.data)
    return retweet(data['tweet_id'])