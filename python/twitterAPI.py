import tweepy
import os
from textblob import TextBlob
from keys import consumer_key, consumer_secret, access_token, access_token_secret

auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_token, access_token_secret)

api = tweepy.API(auth)

def followPeople(thatSaid, polarityMin = 0.3, atMost = 5):
    print('Finding people to follow that said ' + thatSaid)
    public_tweets = api.search(thatSaid, count=atMost, tweet_mode='extended')
    following = []
    tweeters = []
    for tweet in public_tweets:
        user = tweet.user
        tweetInfo = {
            'user': {
                'name': user.name,
                'twitter_handle': user.screen_name,
                'id': user.id,
                'url': user.url,
                'profile_img': user.profile_image_url_https
            },
            'tweet': {
                '_id': tweet.id,
                'text': tweet.full_text,
                'date': tweet.created_at,
                # 'url': tweet.entities['urls'][0]['url'] or ''
            }
        }
        tweeters.append(tweetInfo)
        analysis = TextBlob(tweet.text)
        sentiment = analysis.sentiment
        if(sentiment.polarity > 0.3):
            api.create_friendship(tweet.user.id)
            following.append(tweet.user.name)

    return following, tweeters

def get_tweets(thatSaid, atMost = 5):
    public_tweets = api.search(thatSaid, count=atMost, tweet_mode='extended')
    tweeters = []
    for tweet in public_tweets:
        user = tweet.user
        tweetInfo = {
            'user': {
                'name': user.name,
                'twitter_handle': user.screen_name,
                'id': user.id,
                'url': user.url,
                'profile_img': user.profile_image_url_https
            },
            'tweet': {
                '_id': tweet.id,
                'text': tweet.full_text,
                'date': tweet.created_at,
                # 'url': tweet.entities['urls'][0]['url'] or ''
            }
        }
        tweeters.append(tweetInfo)
    return tweeters
    
# user = 'realDonaldTrump'
# gotten_user = api.get_user(user)

# public_tweets = api.mentions_timeline(gotten_user._json['id'])

def create_friendship(id):
    newFriend = api.create_friendship(id)
    return 'Following new friend'

def create_favorite(id):
    newFriend = api.create_favorite(id)
    return 'Loved a tweet'

def retweet(id):
    newFriend = api.retweet(id)
    return 'Retweeted a tweet'



if __name__ == "__main__":
    followPeople('YCombinator')