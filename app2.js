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