const urlModel = require("../models/urlModel")
const shortId = require('shortid')
const validUrl = require('valid-url')


//........................................redis.................................................

const redis = require("redis");

const { promisify } = require("util");


const redisClient = redis.createClient({host:'redis-17454.c15.us-east-1-4.ec2.cloud.redislabs.com',
port:17454,
username:'functioup-free-db',
password:'yiIOJJ2luH3yHDzmp0WppDFtuUxn5aqO'});


redisClient.on('connect',() => {
    console.log('connected to redis successfully!');
})

redisClient.on('error',(error) => {
    console.log('Redis connection error :', error);
})

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


const isValid = function (value) {
    if (typeof value == undefined || value == null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}
//...........................................................create short url...................................................


const createUrl = async function (req, res) {
    try {

        const longUrl1 = req.body



        if(Object.keys(longUrl1).length == 0){return res.status(400).send({status:false, message: "please input data in body"})}




        const {longUrl} = longUrl1




        if (!isValid(longUrl)) {
            return res.status(400).send({ status: false, message: "Long URL required" })
        }

        if (!(/^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/.test(longUrl))) {
            return res.status(400).send({ status: false, message: "Invalid LongURL" })
        }

       
        if (!longUrl) {
            
            return res.status(400).send({ status: false, message: "please provide required input field" })
        
        }



        const baseUrl = "http://localhost:3000"



        if (!validUrl.isUri(baseUrl)) {

            return res.status(400).send({ status: false, message: "invalid base URL" })

        }



        const cahcedUrlData = await GET_ASYNC(`${longUrl}`)
        let short_url = JSON.parse(cahcedUrlData)




        if (short_url) {

            return res.status(200).send({ status:true, data: short_url })

        }

        let urlPresent = await urlModel.findOne({ longUrl: longUrl }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 })

        if (urlPresent) {

            await SET_ASYNC(`${longUrl}`, JSON.stringify(urlPresent))


            return res.status(200).send({ status: true, data: urlPresent })

        }

        const urlCode = shortId.generate()

        const url = await urlModel.findOne({ urlCode: urlCode })

        if (url) {

            return res.status(400).send({ status: false, message: "urlCode already exist in tha db"})

        }

        const shortUrl = baseUrl + '/' + urlCode

        const dupshortUrl = await urlModel.findOne({ shortUrl: shortUrl })

        if (dupshortUrl) {

            return res.status(400).send({ status: false, message: "shortUrl already exist in tha db" })

        }

        const newUrl = {
            longUrl: longUrl,
            shortUrl: shortUrl,
            urlCode: urlCode
        }


        const createUrl = await urlModel.create(newUrl)

        return res.status(201).send({ status: true, data: newUrl })

    }

    catch (err) {

        return res.status(500).send({ status: false, message: err.message })

    }

}



//..............................................get by params.....................................


const getUrl = async function (req, res) {
    try {
        const urlCode = req.params.urlCode

        if(!urlCode) { return res.status(404).send({ status: false, message: "urlCode required" }) }


        if (!shortId.isValid(urlCode)) { return res.status(404).send({ status: false, message: "Invalid urlCode" }) }

        let cahcedUrlCode = await GET_ASYNC(`${urlCode}`)

        if (cahcedUrlCode) {

            return res.status(302).redirect(JSON.parse(cahcedUrlCode))

        }
        const url = await urlModel.findOne({ urlCode: urlCode })

        if (url) {
            SET_ASYNC(`${urlCode}`, JSON.stringify(url.longUrl))

            return res.status(302).redirect(url.longUrl)

        }
        else {
            return res.status(404).send({ status: false, message: "No such URL FOUND" })
        }
    } catch (err) {
        return res.status(500).send({ status: true, message: err.message })
    }
}


module.exports.createUrl = createUrl
module.exports.getUrl = getUrl









































// const createUrl = async function(req,res){
//     try {  
//         let data = await GET_ASYNC(`${req.body.longUrl}`)
    
//    const {longUrl} = data

//     if (!Object.keys(longUrl).length>0) {return res.status(400).send({status: false, message: "please input Some data"})}

// if(!isValid(longUrl)){return res.status(400).send({status:false, message: "please input longUrl"})}

// if(!(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)\.[a-z]{2,5}(:[0-9]{1,5})?(\/.)?$/.test(longUrl))){

//     return res.status(400).send({status:false, message: "please enter a valid URL"})
// }

//     if (!validUrl.isUri(baseUrl)) {
//         return res.status(401).send('Invalid base URL')
//     }

//     const urlCode = shortid.generate()


//     if (validUrl.isUri(data)) {
        
           
//             let url = await urlModel.findOne({urlCode:req.body.longUrl})

//             if (url) {
//                return res.status(200).send({status:false,message: "URL already exist please check in DataBase", Data: url})
               
//             } else {
          
//                 const shortUrl = baseUrl + '/' + urlCode

//                 newUrl = await urlModel.create({longUrl,shortUrl,urlCode})
          

//                 const finalData = {longUrl:newUrl.longUrl, shortUrl:newUrl.shortUrl, urlCode:newUrl.urlCode}
//                 await SET_ASYNC(`${req.body.longUrl}`, JSON.stringify(finalData))
//                return res.status(201).send({status:true, message:finalData})
//             }}
   

//  }catch (err) {
           
//            return res.status(500).send({status:false,message:err.message})
//         }
    
// }



///////////////////get//////////////////////////////////////////////////////////


// let getUrl = async function (req, res) {
// const data = req.params.urlCode

// if (!Object.keys(data).length>0) {return res.status(400).send({status: false, message: "please input Some data"})}

// //if(!isValid(data)){return res.status(400).send({status:false, message: "please input urlcode"})}

// const output = await urlModel.findOne({urlCode:data})

// if(!output){return res.status(404).send({status:false, message: "not found"})}

// return res.status(200).redirect(output.longUrl)

// }





























// const urlModel = require("../models/urlModel")
// const shortId = require('shortid')
// const validUrl = require('valid-url')


// //........................................redis.................................................

// const redis = require("redis");

// const { promisify } = require("util");
// // const { url } = require("inspector");


// const redisClient = redis.createClient({host:'redis-17454.c15.us-east-1-4.ec2.cloud.redislabs.com',
// port:17454,
// username:'functioup-free-db',
// password:'yiIOJJ2luH3yHDzmp0WppDFtuUxn5aqO'});


// redisClient.on('connect',() => {
//     console.log('connected to redis successfully!');
// })

// redisClient.on('error',(error) => {
//     console.log('Redis connection error :', error);
// })

// //Connection setup for redis

// const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
// const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


// const isValid = function (value) {
//     if (typeof value == undefined || value == null) return false
//     if (typeof value === 'string' && value.trim().length === 0) return false
//     return true
// }
// //...........................................................create short url...................................................


// const createUrl = async function (req, res) {
//     try {

//         const longUrl1 = req.body

//         if(Object.keys(longUrl1).length == 0){return res.status(400).send({status:false, message: "please input some data in body"})}

//         const {longUrl} = longUrl1

//         if (!isValid(longUrl)) {
//             return res.status(400).send({ status: false, message: "Long URL required" })
//         }

//         if (!(/^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/.test(longUrl))) {
//             return res.status(400).send({ status: false, message: "Invalid LongURL" })
//         }

//         // if (!(/^\S*$/.test(longUrl))) {

//         //     return res.status(400).send({ status: false, message: "Not a valid LongURL" })

//         // }

//         if (!longUrl) {
            
//             return res.status(400).send({ status: false, message: "please provide required input field" })
        
//         }

//         const baseUrl = "http://localhost:3000"

//         if (!validUrl.isUri(baseUrl)) {

//             return res.status(400).send({ status: false, message: "invalid base URL" })

//         }

//         const cachedUrlData = await GET_ASYNC(`${longUrl}`)
//         let short_url = JSON.parse(cachedUrlData)
//         if (short_url) {

//             return res.status(200).send({ status: "true", data: { longUrl: short_url.longUrl, shortUrl: short_url.shortUrl, urlCode: short_url.urlCode } })

//         }


        

//         const urlCode = shortId.generate()

//         const url = await urlModel.findOne({ urlCode: urlCode })

//         if (url) {

//             return res.status(400).send({ status: false, message: "urlCode already exist in tha database" })

//         }

//         const shortUrl = baseUrl + '/' + urlCode

//         const dupshortUrl = await urlModel.findOne({ shortUrl: shortUrl })

//         if (dupshortUrl) {

//             return res.status(400).send({ status: false, message: "shortUrl already exist in tha db" })

//         }

//         const newUrl = {
//             longUrl: longUrl,
//             shortUrl: shortUrl,
//             urlCode: urlCode
//         }


//         const data = await urlModel.create(newUrl)
//         await SET_ASYNC(`${data.longUrl}`, JSON.stringify(data))


//         return res.status(201).send({ status: true, data: { longUrl: data.longUrl, shortUrl: data.shortUrl, urlCode: data.urlCode }})

//     }

//     catch (err) {

//         return res.status(500).send({ status: false, message: err.message })

//     }

// }



// //..............................................get by params.....................................


// const getUrl = async function (req, res) {
//     try {
//         const urlCode = req.params.urlCode

//         if(!urlCode) { return res.status(400).send({ status: false, message: "urlCode required" }) }


//         if (!shortId.isValid(urlCode)) { return res.status(400).send({ status: false, message: "Invalid urlCode" }) }

//         let getShortUrl = await GET_ASYNC(`${urlCode}`)
//         url = JSON.parse(getShortUrl)
//         if(url){
//             console.log(url)
//             return res.status(307).redirect(url.longUrl)
            
//         } else{
//             let findUrlCode = await urlModel.findOne({urlCode :urlCode})

//             if(!findUrlCode) return res.status(400).send({status:false,message:"urlcode is not present in Database"})
//             await SET_ASYNC(`${urlCode}`, JSON.stringify(findUrlCode))
//             return res.status(307).redirect(findUrlCode.longUrl)
//         }
//     } catch (err) {
//         return res.status(500).send({ status: true, message: err.message })
//     }
// }


// module.exports.createUrl = createUrl
// module.exports.getUrl = getUrl
