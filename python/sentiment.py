import tweepy
import os
from textblob import TextBlob
from keys import consumer_key, consumer_secret, access_token, access_token_secret

auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_token, access_token_secret)

api = tweepy.API(auth)

public_tweets = api.search('YCombinator', count=10)

# user = 'realDonaldTrump'
# gotten_user = api.get_user(user)

# public_tweets = api.mentions_timeline(gotten_user._json['id'])


for tweet in public_tweets:
    print(tweet.text)
    print(tweet.user.name)
    print(tweet.user.id)
    analysis = TextBlob(tweet.text)
    sentiment = analysis.sentiment
    print(sentiment)
    if(sentiment.polarity > 0.3):
        api.create_friendship(tweet.user.id)
    print('=========================================')
