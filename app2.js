require('dotenv').config()

const express = require('express');
const _ = require('lodash');
const app = express();
const session = require('express-session');
const needle = require("needle");
const {TwitterApi} = require('twitter-api-v2');
app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))
app.use('/favicon.ico', express.static('images/favicon.ico'));
app.use("/public", express.static('./public/'));
app.use(express.static("public"))

const id = "1526576343764283392";
const likedTweetsendpointURL = `https://api.twitter.com/2/users/${id}/liked_tweets`;
const token = process.env.BEARER_TOKEN;

function twitterRoute() {
  const tweets = new express.Router();

  // GET REST endpoint - query params may or may not be populated
  tweets.get("/", function (req, res) {
    console.log(new Date(), "In twitter route GET / req.query=", req.query);

    (async () => {
      try {
        // Make request
        const response = await getLikedTweets();

        //return result
        console.log("Tweet likes data received");
        res.json({ response });
      } catch (e) {
        console.log(e);
      }
    })();
  });

  async function getLikedTweets() {
    // The default parameters - only the Tweet ID and text are returned
    const params = {
      "tweet.fields": "lang,author_id",
      "user.fields": "created_at",
    };

    // this is the HTTP header that adds bearer token authentication
    const res = await needle("get", likedTweetsendpointURL, params, {
      headers: {
        "User-Agent": "LikedTweetsTestCode",
        authorization: `Bearer ${token}`,
      },
    });

    if (res.body) {
      return res.body;
    } else {
      throw new Error("Unsuccessful request");
    }
  }

  return tweets;
}


app.get("/api/tweet/:id",twitterRoute);
let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function () {
    console.log('serwer is working on port 3000')
})



const BearerToken = process.env.BTOKEN;
const endpointUrl = "https://api.twitter.com/2/tweets/search/recent";

//Get Tweets from Twitter API
const getTweets = async(id) => {

    const params = {
        'query': 'from:'+id+' -is:retweet',
        'tweet.fields': 'created_at',
        'expansions': 'author_id'
    }
    const response = await needle ('get', endpointUrl, params,{
        headers: {
            "User-Agent": "v2RecentSearchJS",
            "authorization": `Bearer ${BearerToken}`
        }
    })
    console.log(response.statusCode)
    if (response.statusCode !== 200) {
        if (response.statusCode === 403) {
            res.status(403).send(response.body);
        } 
        else {
            throw new Error(response.body.error.message);
        }
    }
    if (response.body)
        return response.body;
    else
        throw new Error("Unsuccessful Request");   
}

//This returns the object to client
const getTweetAnalysis = async(req, res) => {
    try {
        let twitterData =await getTweets(req.params.id);
        //res.send(twitterData);
        res.send(await analyze(twitterData));
    } catch (error) {
        res.send(error);
    }

}

//Simple Analysis
const twitterObject = {}
const analyze = async(twitterData) =>
{
    twitterObject["username"] = twitterData.includes.users[0].username;
    twitterObject["name"] = twitterData.includes.users[0].name;
    // console.log(twitterData.data[0].text)
    let averageCharacter = 0;
    let averageWord = 0;
    let totalCharacter = 0;
    let totalWord = 0;
    let texts = twitterData.data;
    if(texts)
    {
        for(let index =0 ; index < twitterData.data.length ; index++)
        {
            totalCharacter += texts[index].text.length;
            totalWord += texts[index].text.split(" ").length;
        }
    }
    if(twitterData.meta.result_count > 0)
    {
        twitterObject["usesActively"] =  true;
        averageCharacter = totalCharacter/twitterData.meta.result_count;
        averageWord = totalWord/twitterData.meta.result_count;
    }
    else
    {
        twitterObject["usesActively"] =  false;
    }
    twitterObject["averageWordCount"] = averageWord;
    twitterObject["averageCharacterCount"] = averageCharacter;
    return twitterObject;
}