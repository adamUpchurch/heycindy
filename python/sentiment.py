import tweepy
from textblob import TextBlob

consumer_key='PzkM9P327Gu2mdfKEL7mbZHKB'
consumer_secret='Ci8C82GUCyOng4u28AlJdi7s5xRaswHVw9NmsMZ2lj8sXhA9Mo'

access_token='1098302864060022787-pJzGfMKjBWPVN7HogKJB4BgDNlzwha'
access_token_secret='7ySZJQehLmpzts4jUf8e0PAM5ZsLA6cm4duYTOX9ewXoy'

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
