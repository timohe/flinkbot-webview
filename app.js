"use strict";
// more samples here https://github.com/Azure-Samples/documentdb-node-getting-started/blob/master/app.js
var documentClient = require("documentdb").DocumentClient;
var url = require('url');
var restify = require('restify');
var dotenv = require("dotenv");
dotenv.config();

var express = require('express');
var app = express();

//database settings
var client = new documentClient(process.env.COSMOS_ENDPOINT, { "masterKey": process.env.COSMOS_PRIMARY_KEY });
var HttpStatusCodes = { NOTFOUND: 404 };
var databaseUrl = `dbs/${process.env.COSMOS_DATABASE_ID}`;
var collectionUrl = `${databaseUrl}/colls/${process.env.COSMOS_COLLECTION_ID}`;

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
writeValue("I1KJ4DNAAEP,userData", "address", "josefstrasse 111");




app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port 3000!');
  console.log(process.versions)
  
});