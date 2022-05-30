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

const client = new TwitterApi({
    appKey: process.env.API_KEY,
    appSecret: process.env.API_SECRET,
    accessToken: process.env.ATOKEN,
    accessSecret: process.env.ATS,
});

//https://api.twitter.com/2/tweets/search/recent?query=
console.log(client.v2.search('Javascript').then(res => res))

//API route 
//app.get("/api/tweet/:id",getTweetAnalysis);
// const jsTweets = await client.v2.search('JavaScript', { 'media.fields': 'url' });
// // Consume every possible tweet of jsTweets (until rate limit is hit)
// for await (const tweet of jsTweets) {
//   console.log(tweet);
// }

// const getTweetAnalysis = async(req, res) => {
//     try {
//         let twitterData =await getTweets(req.params.id);
//         //res.send(twitterData);
//         res.send(await analyze(twitterData));
//     } catch (error) {
//         res.send(error);
//     }

// }


// const getTweetAnalysis = async(req, res) => {
//     try {
//         const jsTweets = await client.v2.search('JavaScript', { 'media.fields': 'url' });
//         // Consume every possible tweet of jsTweets (until rate limit is hit)
//         for await (const tweet of jsTweets) {
//             res.send(tweet)
//         }
//     } catch (error) {
//         res.send(error);
//     }

// }

app.get('/callback', (req, res) => {

    // Obtain the persistent tokens
    // Create a client from temporary tokens
    const client = new TwitterApi({
        appKey: process.env.API_KEY,
        appSecret: process.env.API_SECRET,
        accessToken: process.env.ATOKEN,
        accessSecret: process.env.ATS,
    });

    const getData = async() => {
        const jsTweets  = await client.v2.search('icecream', { 'media.fields': 'preview_image_url' });
        const data = jsTweets
        return data
    }
      
    console.log(1);
    console.log(2);
    const contex = getData().then(twit => res.send(twit))

    // async function start() {
    //     const jsTweets = await client.v2.search('JavaScript', { 'media.fields': 'url' });
    //     for await (const tweet of jsTweets) {
    //         console.log(tweet);
    //         res.send(tweet)
    //       }
    // }
    // // Consume every possible tweet of jsTweets (until rate limit is hit)

    // start()

  });








// const jsTweets = await client.v2.search('JavaScript', { 'media.fields': 'url' });

// // Consume every possible tweet of jsTweets (until rate limit is hit)
// for await (const tweet of jsTweets) {
//   console.log(tweet);
// }



//app.get("/api/tweet/:id",getTweetAnalysis);
let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function () {
    console.log('serwer is working on port 3000')
})