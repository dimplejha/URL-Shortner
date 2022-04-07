const urlModel = require("../models/urlModel")
var validUrl = require('valid-url');
const shortid = require('shortid')
const redis = require("redis");
const { promisify } = require("util");



const redisClient = redis.createClient(
    17454,
    'redis-17454.c15.us-east-1-4.ec2.cloud.redislabs.com',
    { no_ready_check: true }
);
redisClient.auth('yiIOJJ2luH3yHDzmp0WppDFtuUxn5aqO', function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});


const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);



let isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const baseUrl = 'http://localhost:3000'


let createUrl = async function (req, res) {
    try {
        let requestBody = req.body
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Enter valid Parameters" })
        }

        if (!validUrl.isUri(baseUrl)) {
            return res.status(400).send({ status: false, message: "Invalid base URL" })
        }

        const { longUrl } = requestBody

        if (!longUrl) { return res.status(400).send({ status: false, message: "LongUrl required" }) }

        if (!(/^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/.test(longUrl))) {
            return res.status(400).send({ status: false, message: "Invalid LongURL" })
        }
        if (!(/^\S*$/.test(longUrl))) {
            return res.status(400).send({ status: false, message: "Not a valid LongURL" })
        }

        let getShortUrl = await GET_ASYNC(`${longUrl}`)
        console.log(getShortUrl)
        let short_url = JSON.parse(getShortUrl)
        console.log(short_url)
        if (short_url) {
            return res.status(200).send({ status: true, data: { longUrl: short_url.longUrl, shortUrl: short_url.shortUrl, urlCode: short_url.urlCode } })
        }


        const urlCode = shortid.generate()

        let urlcode = await urlModel.findOne({ urlCode: urlCode })
        

        const shortUrl = baseUrl + '/' + urlCode

        let shorturl = await urlModel.findOne({ shortUrl: shortUrl })
        if (shorturl) {
            return res.status(400).send({ status: false, message: "ShortUrl already exist,Create unique shorturl" ,shortUrl:shortUrl.shortUrl})
        }

        let urlData = {
            longUrl,
            shortUrl,
            urlCode
        }

        let data = await urlModel.create(urlData)
        await SET_ASYNC(`${data.longUrl}`, JSON.stringify(data))
        return res.status(201).send({ status: true, data: { longUrl: data.longUrl, shortUrl: data.shortUrl, urlCode: data.urlCode } })

    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}



let getOriginalUrl = async function (req, res) {
    try {

        const urlCode = req.params.urlCode
        if(!urlCode) { return res.status(400).send({ status: false, message: "urlCode required" }) }

        if (!shortid.isValid(urlCode)) { return res.status(400).send({ status: false, message: "Invalid urlCode" }) }

        let getShortUrl = await GET_ASYNC(`${urlCode}`)
        url = JSON.parse(getShortUrl)
        if(url){
            console.log(url)
            return res.status(303).redirect(url.longUrl)
            
        } else{
            let findUrlCode = await urlModel.findOne({urlCode :urlCode})

            if(!findUrlCode) return res.status(400).send({status:false,message:"urlcode is not present "})
            await SET_ASYNC(`${urlCode}`, JSON.stringify(findUrlCode))
            return res.status(302).redirect(findUrlCode.longUrl)
        }

    }
    
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


module.exports.createUrl = createUrl
module.exports.getOriginalUrl = getOriginalUrl