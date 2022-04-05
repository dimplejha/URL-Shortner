const urlModel = require("../models/urlModel")
const shortid = require('shortid')
const validUrl = require('valid-url')



const isValid = function (value) {
    if (typeof value == undefined || value == null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const baseUrl = 'http://localhost:3000'

const createUrl = async function (req, res) {

    try {

        data = req.body

        const { longUrl } = data

        if (!Object.keys(data).length > 0) { 
            
            return res.status(400).send({ status: false, message: "please input Some data" }) 
        
        }

        if (!isValid(longUrl)) { 
            
            return res.status(400).send({ status: false, message: "please input longUrl" })
        
        }

       if(!(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(longUrl.trim()))){
           
        return res.status(400).send({ status: false, message: "please enter a valid URL" })

        }



        if (!validUrl.isUri(baseUrl)) {

            return res.status(401).send({ status: false, message: 'Invalid base URL' })

        }

        const urlCode = shortid.generate()


        if (validUrl.isUri(longUrl)) {


            let url = await urlModel.findOne({ longUrl })

            if (url) {

                return res.status(200).send({ status: false, message: "url already exist" })


            } else {

                const shortUrl = baseUrl + '/' + urlCode
                // if (!(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/.test(shortUrl))) {
                //     return res.send("Short Url is Not in the proper formate")
                // }
                    urlData = await urlModel.create({ shortUrl, longUrl, urlCode })

                    const newObj = {
                        shortUrl: urlData.shortUrl,
                        longUrl: urlData.longUrl,
                        urlCode: urlData.urlCode
                    }

                    return res.status(201).send({ status: true, data: newObj })
                }
            }
        }catch (err) {

            return res.status(500).send({ status: false, message: err.message })

        }

    }




const getUrl = async function (req, res) {

    const data = req.params.urlCode

    const output = await urlModel.findOne({ urlCode: data })
console.log(output)
    if (!output) { return res.status(404).send({ status: false, message: "The Url you are requesting for not found" }) }

    return res.status(200).redirect(output.longUrl)

}



module.exports.createUrl = createUrl
module.exports.getUrl = getUrl