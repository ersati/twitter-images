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
     res.render('list')
}

app.get('/', main)
app.post("/images", (req, res) => {
    const query = req.body.search
    console.log(req.body.search)
    res.redirect(`/images/${query}`)
}) 
app.post("/revert", (req, res) => {
    res.redirect("/")
})
app.get("/images/:img", (req, res) => {
    const query = req.params.img
    const BearerToken = process.env.BTOKEN;
    const endpointUrl = "https://api.twitter.com/2/tweets/search/recent";
    const getTweets = async(id) => {
        const params = {
            'query': id+' -has:mentions',
            'expansions': 'attachments.media_keys', 
            'user.fields': 'profile_image_url',
            'media.fields': 'url',
            'max_results': 100,
            "tweet.fields": "attachments"
        }
        const response = await needle ('get', endpointUrl, params,{
            headers: {
                "User-Agent": "v2RecentSearchJS",
                "authorization": `Bearer ${BearerToken}`
            }
        })
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
        res.render('twit', data.includes)
    }
    try{
        let data = getTweets(query)
        let grab = data.then(res => {res ? flage=true : falge=false; return info(res)})
    }
    catch (error){
        console.log('ok')
    }

})
app.get('*', function(req, res) {
    res.redirect('/');
});
let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function () {
    console.log('serwer is working on port 3000')
})