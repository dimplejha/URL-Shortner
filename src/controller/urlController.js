const urlModel = require("../models/urlModel")
let axios = require("axios")


const isValid = function(value){
    if(typeof value ==undefined ||  value ==null)return false
    if(typeof value==='string'&&value.trim().length===0) return false
    return true
}

const createUrl = async function(req,res){
try{

    let data = req.body

if(!isValid(data)){return res.status.send({status:false, message : "please provide data"})}

if(!isValid(data.longUrl)){return res.status(400).send({status:false, message : "please provide longUrl"})}

    if(!(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/.test(data.longUrl))){
        return res.send(400).send({status:false, message : "Please input a valid url"})
    }

const savedData = await urlModel.create(data)

return res.status(201).send({status: true, message: savedData})

}catch (error){
    return res.status(500).send({status:false, message:error.message})

}}



let getUrl = async function (req, res) {

    try {
        let options = {
            method: 'get',
            url: ''
        }
        let result = await axios(options);
        console.log(result)
        let data = result.data
        res.status(200).send({ msg: data, status: true })
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message })
    }
}



module.exports.createUrl = createUrl
module.exports.getUrl = getUrl