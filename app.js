require('dotenv').config()

const express = require('express');
const _ = require('lodash');
const app = express();
const session = require('express-session');
const needle = require("needle");
app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))
app.use('/favicon.ico', express.static('images/favicon.ico'));
app.use("/public", express.static('./public/'));
app.use(express.static("public"))
//app.use(express.static("public"));
const main = (req, res) => {
    const dat = {
        name: "Piotr"
    }
    const BearerToken = process.env.BTOKEN;
    //const endpointUrl = "https://api.twitter.com/2/tweets";
    //const endpointUrl = "https://api.twitter.com/2/tweets/search/stream";
    const endpointUrl = "https://api.twitter.com/2/tweets/search/recent";
    const getTweets = async(id) => {

        const params = {
            'query': id+' -has:mentions',
            'expansions': 'attachments.media_keys', 
            'user.fields': 'profile_image_url',
            'media.fields': 'url',
            'max_results': 100,
            //"place.fields": "full_name",
            "tweet.fields": "attachments"

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
    let flage = false;
    function info(data) {
        console.log(data)
        console.log(data.includes)
        //data.data.forEach(el => console.log(el.attachments));
        console.log(flage)
        res.render('twit', data.includes)
    }
    try{

        let data = getTweets('Jeff Bezos')
        
        let grab = data.then(res => {res ? flage=true : falge=false; return info(res)})

        // if (flage){
        //     console.log(grab)
        //     info(grab)
        // }


    }catch (error){
        console.log('ok')
    }
    console.log(flage)
    //res.send(await getTweets('Javascript'))
     //res.render('list', dat)
}



app.get('/', main)

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
    console.log(twitterData.data[0].text)
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

//API route 
app.get("/api/tweet/:id",getTweetAnalysis);

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function () {
    console.log('serwer is working on port 3000')
})