import tweepy
import os
from textblob import TextBlob
# from keys import consumer_key, consumer_secret, access_token, access_token_secret

# auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
# auth.set_access_token(access_token, access_token_secret)

# api = tweepy.API(auth)

def twitterAPI(twitter):
    auth = tweepy.OAuthHandler(twitter['consumer_key'], twitter['consumer_secret'])
    auth.set_access_token(twitter['access_token'], twitter['access_token_secret'])
    return tweepy.API(auth)

def followPeople(thatSaid, credentials, polarityMin = 0.3, atMost = 5):
    api = twitterAPI(credentials)
    print('Finding people to follow that said ' + thatSaid)
    public_tweets = api.search(thatSaid, count=atMost, tweet_mode='extended')
    following = []
    for tweet in public_tweets:
        user = tweet.user
        blob = TextBlob(tweet.full_text)
        sentiment = blob.sentiment
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
                'subjectivity': blob.subjectivity,
                'polarity': blob.polarity
            }
        }
        if(sentiment.polarity > polarityMin):
            api.create_friendship(tweet.user.id)
            following.append(tweetInfo)
    return following

def get_tweets(thatSaid, credentials, atMost = 10):
    api = twitterAPI(credentials)
    public_tweets = api.search(thatSaid, count=atMost, tweet_mode='extended')
    tweeters = []

    for tweet in public_tweets:
        user = tweet.user
        blob = TextBlob(tweet.full_text)
        print(blob.sentiment)
        print(blob.polarity)
        print(blob.sentiment.subjectivity)
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
                'sentiment': blob.sentiment,
                'polarity': blob.polarity
                # 'url': tweet.entities['urls'][0]['url'] or ''
            }
        }
        tweeters.append(tweetInfo)
    return tweeters
    
# user = 'realDonaldTrump'
# gotten_user = api.get_user(user)

# public_tweets = api.mentions_timeline(gotten_user._json['id'])

def create_friendship(id, credentials):
    api = twitterAPI(credentials)
    api.create_friendship(id)
    return 'Following new friend'

def create_favorite(id, credentials):
    api = twitterAPI(credentials)
    api.create_favorite(id)
    return 'Loved a tweet'

def retweet(id, credentials):
    api = twitterAPI(credentials)
    api.retweet(id)
    return 'Retweeted a tweet'

def reply_to_tweet(id, status, credentials):
    api = twitterAPI(credentials)
    api.update_status(status=status, in_reply_to_status_id=id)
    return 'Retweeted a tweet'

if __name__ == "__main__":
    followPeople('YCombinator')