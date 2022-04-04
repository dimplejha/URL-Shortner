const express = require('express');
const router = express.Router();

const url= require("../controller/urlController")


router.post("/url/shorten", url.createUrl)

router.get("/:urlCode", url.getUrl)

module.exports= router;