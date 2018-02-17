"use strict";
// more samples here https://github.com/Azure-Samples/documentdb-node-getting-started/blob/master/app.js
// EJS express node turorial https://codeburst.io/build-a-weather-website-in-30-minutes-with-node-js-express-openweather-a317f904897b

var documentClient = require("documentdb").DocumentClient;
var url = require('url');
var restify = require('restify');
var dotenv = require("dotenv");
var bodyParser = require('body-parser');
const request = require('request');

dotenv.config();

var express = require('express');
var app = express();

//database settings
var client = new documentClient(process.env.COSMOS_ENDPOINT, { "masterKey": process.env.COSMOS_PRIMARY_KEY });
var HttpStatusCodes = { NOTFOUND: 404 };
var databaseUrl = `dbs/${process.env.COSMOS_DATABASE_ID}`;
var collectionUrl = `${databaseUrl}/colls/${process.env.COSMOS_COLLECTION_ID}`;

// expose the public folder so it can be used.
app.use(express.static('public'));
// use body Parser middleware to get variables submitted (req.body)
app.use(bodyParser.urlencoded({ extended: true }));
//use EJS (no require needed)
app.set('view engine', 'ejs')

//route for /get
app.get('/', function (req, res) {
    res.render('index');
});

app.post('/', function (req, res) {
    let city = req.body.city;
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`
    request(url, function (err, response, body) {
        if(err){
            res.render('index', {weather: null, error: 'Error, please try again'});
        } else {
            let weather = JSON.parse(body)
        if(weather.main == undefined){
            //second argument is handed to view
            res.render('index', {weather: null, error: 'Error, please try again'});
        } else {
            let weatherText = `It's ${weather.main.temp} degrees in ${weather.name}!`;
            res.render('index', {weather: weatherText, error: null});
      }
    }
  });
  })

app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port 3000!');
//   console.log(process.versions)
  
});



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

// getValue("I1KJ4DNAAEP,userData");
// writeValue("I1KJ4DNAAEP,userData", "address", "josefstrasse 111");


