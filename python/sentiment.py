import tweepy
import os
from textblob import TextBlob
from keys import consumer_key, consumer_secret, access_token, access_token_secret

auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_token, access_token_secret)

api = tweepy.API(auth)

def followPeople(thatSaid, polarityMin = 0.3, atMost = 5):
    print('Finding people to follow that said ' + thatSaid)
    public_tweets = api.search(thatSaid, count=atMost)
    following = []
    tweeters = []
    for tweet in public_tweets:
        user = tweet.user
        print(tweet.entities['urls'])
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
                'text': tweet.text,
                'date': tweet.created_at,
                # 'url': tweet.entities['urls'][0]['url'] or ''
            }
        }
        print(tweetInfo)
        tweeters.append(tweetInfo)
        analysis = TextBlob(tweet.text)
        sentiment = analysis.sentiment
        if(sentiment.polarity > 0.3):
            api.create_friendship(tweet.user.id)
            following.append(tweet.user.name)
        print('=========================================')
    print(tweeters)
    print()
    print('=========================================')
    print()
    print(following)
    return following, tweeters
    
# user = 'realDonaldTrump'
# gotten_user = api.get_user(user)

# public_tweets = api.mentions_timeline(gotten_user._json['id'])


if __name__ == "__main__":
    followPeople('YCombinator')