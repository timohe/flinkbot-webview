"use strict";
//more samples here https://github.com/Azure-Samples/documentdb-node-getting-started/blob/master/app.js
var documentClient = require("documentdb").DocumentClient;
var url = require('url');

var dotenv = require("dotenv")
dotenv.config();


//database settings
var client = new documentClient(process.env.COSMOS_ENDPOINT, { "masterKey": process.env.COSMOS_PRIMARY_KEY });
var HttpStatusCodes = { NOTFOUND: 404 };
var databaseUrl = `dbs/${process.env.COSMOS_DATABASE_ID}`;
var collectionUrl = `${databaseUrl}/colls/${process.env.COSMOS_COLLECTION_ID}`;

//change this value according to user
// var documentId = "I1KJ4DNAAEP,userData";

/**
 * Get the document by ID, or create if it doesn't exist.
 * @param {function} callback - The callback function on completion
 */
function getDocument(param_documentId) {
    let documentUrl = `${collectionUrl}/docs/${param_documentId}`;
    console.log(`Getting Bot document: ${documentUrl}`);
    return new Promise((resolve, reject) => {
        client.readDocument(documentUrl, (err, result) => {
            if (err) {
                // console.log(err);
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    client.createDocument(collectionUrl, document, (err, created) => {
                        if (err) reject(err)
                        else resolve(created);
                    });
                } else {
                    // console.log(err);
                    reject(err);
                }
            } else {
                // console.log(err);                
                resolve(result);
            }
        });
    });
};

/**
 * Add or replace an entry in the Database
 */
function replaceDocument(documentId, newdocument) {
    let documentUrl = `${collectionUrl}/docs/${documentId}`;
    console.log(`Replacing document:\n${documentId}\n`);
    return new Promise((resolve, reject) => {
        client.replaceDocument(documentUrl, newdocument, (err, result) => {
            if (err) reject(err);
            else {
                resolve(result);
            }
        });
    });
};

/**
 * Get Object from Database
 */
async function getValue(para_documentId){
    console.log("getValue started")
    try{
        let value = await getDocument(para_documentId);
        console.log("This is the document: "+ JSON.stringify(value));
        return value;
    } catch (err){
        return err;
    }
}

/**
 * Change or create a new Value in the database
 */
async function writeValue(para_documentId, key, value){
    try{
        let oldDocument = await getDocument(para_documentId);
        oldDocument.data[key] = value;
        let docAfterReplacing = await replaceDocument(para_documentId, oldDocument);
        console.log("This is updated document: " + "\n" +  JSON.stringify(docAfterReplacing));
        return docAfterReplacing;
    } catch (err){
        return err;
    }
}

getValue("I1KJ4DNAAEP,userData");
writeValue("I1KJ4DNAAEP,userData", "address", "josefstrasse 23");



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