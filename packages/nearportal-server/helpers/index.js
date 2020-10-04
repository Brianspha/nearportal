
const { Client, ThreadID, PrivateKey } = require('@textile/hub')
const dateFormat = require('dateformat');
const { set } = require('../app/app');
require("dotenv").config({});
const randomString = require('randomstring')
const config = require('../config/config')
async function init() {
    return new Promise(async (resolve) => {
        var created = await Promise.resolve(checkSetUp())
        if (!created.found) {
            var client = await Client.withKeyInfo(config.keyInfo);
            const identity = PrivateKey.fromRawEd25519Seed(randomString.generate({ length: 32 }))
            await client.getToken(identity)
            const threadId = ThreadID.fromRandom();
            console.log('client: ', client, 'threadId: ', threadId.toBytes(), ' identity: ', identity)
            await client.newDB(threadId)
            console.log('threadId: ', threadId)
            const schema = {
                "type": "object",
                "properties": {
                    "file": {
                        "type": "string"
                    },
                    "_id": {
                        "type": "string"
                    },
                },
                "required": [
                    "file",
                    "_id"
                ]
            }
            console.log('schema: ', schema)
            /**
             * We add our first Collection to the DB for any schema.
             */
            await client.newCollection(threadId, { name: 'files', schema });
            var day = dateFormat(Date.now(), "yyyy-mm-dd h:MM:ss");
            console.log('day: ', day)
            const configData = {
                threadId: threadId.toString(),
                created: day,
                identity: identity.seed.toString()
            }
            console.log('threadId.toBytes: ', threadId.toBytes())
            if (!config.fs.existsSync(process.env.CONFIG_PATH_JSON)) {
                config.fs.mkdirSync(process.env.CONFIG_PATH_JSON, { recursive: true }, err => {
                    console.log('error creating dir: ', err)
                });
            }
            var userData = config.store.saveCache('server-setup', { client: client, threadId: threadId.toString(), identity: identity.seed.toString() })
            config.fs.writeFileSync(process.env.CONFIG_FILE_PATH, JSON.stringify(configData))
            console.log("Done setup")
        }
        else {
            var client = await Client.withKeyInfo(config.keyInfo);
            var userData = config.store.saveCache('server-setup', { client: client, threadId: created.config.threadId, identity: created.identity })
            console.log("Done setup")
            resolve(true)
        }
    })
}
async function checkSetUp() {
    return new Promise((resolve) => {
        try {
            var configFile = config.fs.readFileSync(process.env.CONFIG_FILE_PATH)
            configFile = JSON.parse(configFile)
            if (
                !(
                    configFile.hasOwnProperty('threadId') && configFile.hasOwnProperty('created')
                )
            ) {
                throw new Error('Invalid config.json')
            }
            resolve({ config: configFile, found: true })
        } catch (err) {
            console.error('error loading file: ', err)
            resolve({ config: {}, found: false })
        }
    })

}
async function addFile(req, res, next) {

    /**
     * Add a File Image
     *
     * Our Thread contains the Files Collection, so you just need
     * to add a new file that matches the expected schema.
     *
     * If you run this app many times, you'll notice many Buzz Aldrin
     * entries in your ThreadDB, each with a unique ID.
     */
    return new Promise(async (resolve) => {
        console.log('req: ', req.body)
        var setup = await Promise.resolve(checkSetUp())
        setup = setup.config
        var client = await Client.withKeyInfo(config.keyInfo);
        console.log('setup.identity: ', setup.identity.split(','))
        const identity = PrivateKey.fromRawEd25519Seed(setup.identity.split(','))
        console.log('identity: ', identity)
        await client.getToken(identity)
        const restoredThreadId = ThreadID.fromString(setup.threadId)
        const ids = await client.create(restoredThreadId, 'files', [
            req.body,
        ]);
        resolve(true);
        res.status(200).send({ code: 200, saved: true, ids: ids })
    })
}
async function initIndex(buckets, bucketKey, identity) {
    // Create a json model for the index
    const index = {
        author: identity.public.toString(),
        date: (new Date()).getTime(),
        paths: [],
    }
    // Store the index in the Bucket (or in the Thread later)
    const buf = Buffer.from(JSON.stringify(index, null, 2))
    const path = `index.json`
    await buckets.pushPath(bucketKey, path, buf)
}
Promise.resolve(init())
module.exports = {
    addFile,
}