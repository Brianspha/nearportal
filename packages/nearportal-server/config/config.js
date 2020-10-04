require("dotenv").config({});
console.log('process.env',process.env.TEXTITLE_KEY)
const fs = require('fs')
const path = require('path')
const keyInfo = {
    key: process.env.TEXTITLE_KEY,
    secret: ''
}

module.exports={
    keyInfo:keyInfo,
    store: require('../store/index'),
    threadId: process.env.THREAD_ID,
    fs:fs,
    path:path,
    configPath:process.env.CONFIG_PATH_JSON
}