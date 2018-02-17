"use strict";
//more samples here https://github.com/Azure-Samples/documentdb-node-getting-started/blob/master/app.js
var documentClient = require("documentdb").DocumentClient;
var config = require("./config");
var url = require('url');

var dotenv = require("dotenv")
dotenv.config();


//database settings
var client = new documentClient(process.env.COSMOS_ENDPOINT, { "masterKey": process.env.COSMOS_PRIMARY_KEY });
var HttpStatusCodes = { NOTFOUND: 404 };
var databaseUrl = `dbs/${process.env.COSMOS_DATABASE_ID}`;
var collectionUrl = `${databaseUrl}/colls/${process.env.COSMOS_COLLECTION_ID}`;

//change this value according to user
var userId = "I1KJ4DNAAEP,userData";

/**
 * Get the document by ID, or create if it doesn't exist.
 * @param {function} callback - The callback function on completion
 */
function getDocument(param_userId) {
    let documentUrl = `${collectionUrl}/docs/${param_userId}`;
    console.log(`Getting Bot document: ${documentUrl}`);
    return new Promise((resolve, reject) => {
        client.readDocument(documentUrl, (err, result) => {
            if (err) {
                console.log(err);
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    client.createDocument(collectionUrl, document, (err, created) => {
                        if (err) reject(err)
                        else resolve(created);
                    });
                } else {
                    console.log(err);
                    reject(err);
                }
            } else {
                console.log(err);                
                resolve(result);
            }
        });
    });
};

/**
 * Add or replace an entry in the Database
 */
function replaceDocument(document) {
    let documentUrl = `${collectionUrl}/docs/${document.id}`;
    console.log(`Replacing document:\n${document.id}\n`);
    document.children[0].neu = 7;

    return new Promise((resolve, reject) => {
        client.replaceDocument(documentUrl, document, (err, result) => {
            if (err) reject(err);
            else {
                resolve(result);
            }
        });
    });
};


async function getValue(){
    console.log("getValue started")
    try{
        let value = await getDocument(userId);
        console.log("This is the document: "+ JSON.stringify(value));
        return value;
    } catch (err){
        return err;
    }
}

async function writeValue(){
    try{
        let value = await replaceBotDocument(config.documents.Andersen);
        console.log(value);
        return value;
    } catch (err){
        return err;
    }
}

getValue();




// var restify = require('restify');
    // var port = process.env.PORT || 8080;

    // function respond(req, res, next) {
    //   res.send('hello ' + req.params.name);
    //   next();
    // }

    // var server = restify.createServer();
    // server.get('/hello/:name', respond);
    // server.head('/hello/:name', respond);

    // server.listen(port, function() {
    //   console.log('%s listening at %s', server.name, server.url);
    // });

    // server.get(/\/?.*/, restify.serveStatic({
    //     directory: __dirname,
    //     default: 'form.html'
    // }));