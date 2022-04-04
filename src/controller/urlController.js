const urlModel = require("../models/urlModel")
let axios = require("axios")


const createUrl = async function(req,res){
try{
let data = req.body

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