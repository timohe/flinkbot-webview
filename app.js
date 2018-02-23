"use strict";
// more samples here https://github.com/Azure-Samples/documentdb-node-getting-started/blob/master/app.js
// EJS express node turorial https://codeburst.io/build-a-weather-website-in-30-minutes-with-node-js-express-openweather-a317f904897b
// vscode: shift option f to beautify

var documentClient = require("documentdb").DocumentClient;
var url = require('url');
var restify = require('restify');
var dotenv = require("dotenv");
var bodyParser = require('body-parser');
var request = require('request');
//to make directLine to send data to bot work https://github.com/microsoft/botframework-DirectLinejs
global.XMLHttpRequest = require("xhr2");

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
app.set('view engine', 'ejs');

var userId;
// use like this http://localhost:3000/login?userId=I1KJ4DNAAEP

/**
 * Handle login, save token in azure database
 */
app.get('/', function (req, res) {
    res.send('Go away! There is nothing here at the moment!');
});


/**
 * Handle login, save token in azure database
 */

app.get('/login', function (req, res) {
    userId = req.query('userId');
    userId = userId.substr(0, 16);

    res.render('loginPage', { error: null, userId: `this is your user Id: ${userId}` });
});

app.post('/login', function (req, res) {

    var email = req.body.email;
    var password = req.body.password;
    var options = {
        method: 'POST',
        url: 'https://test.goflink.ch/api/v1/auth',
        headers: { 'Content-Type': 'application/json' },
        body: { username: email, password: password },
        json: true
    };
    request(options, function (error, response, body) {
        if (error) {
            throw new Error(error);
        }
        else {
            console.log("the user Id is" + userId);
            if (!body.error) {
                writeValue(`${userId},userData`, "authToken", body);
                res.redirect('/loginPage_success');
            }
            res.render('loginPage', { error: 'Login failed, please try again', username: "there is the useridbla" });
        }
        console.log(body);
    });

})

app.get('/loginSuccess', function (req, res) {
    res.render('loginPage_success', { closeWebview: true });
});

/**
 * The claims object and post them on database..
 */
//set user id

app.get('/claimObjects', function (req, res) {
    userId = req.query('userId');
    userId = userId.substr(0, 16);
    res.render('claimObjects');
});
app.post('/claimObjects', function (req, res) {

    var objectName1 = req.body.object1;
    var objectPrice1 = req.body.price1;

    writeValue(`${userId},userData`, "claim_object1", objectName1);
    writeValue(`${userId},userData`, "claim_price1", objectPrice1);
})





app.listen(process.env.PORT || 3000, function () {
    console.log('App started and listening on port 3000!');
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
async function getValue(para_documentId) {
    console.log("getValue started")
    try {
        let value = await getDocument(para_documentId);
        console.log("This is the document: " + JSON.stringify(value));
        return value;
    } catch (err) {
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
async function writeValue(para_documentId, key, value) {
    try {
        let oldDocument = await getDocument(para_documentId);
        oldDocument.data[key] = value;
        let docAfterReplacing = await replaceDocument(para_documentId, oldDocument);
        console.log("This is updated document: " + "\n" + JSON.stringify(docAfterReplacing));
        return docAfterReplacing;
    } catch (err) {
        return err;
    }
}


var DirectLine = require('botframework-directlinejs').DirectLine;

app.get('/test', function (req, res) {

    response.send('Hello Idiot!')



    // getValue("I1KJ4DNAAEP,userData");
    // writeValue("I1KJ4DNAAEP,userData", "address", "josefstrasse 111");

    var directLine = new DirectLine({
        secret: "KQrRiwONIeo.cwA.5xs.nOqkzHEhFVRPBUjALfuBHR1AAQpy7EZg4yali8JXcSo",
        // token: /* or put your Direct Line token here (supply secret OR token, not both) */,
        // domain: /* optional: if you are not using the default Direct Line endpoint, e.g. if you are using a region-specific endpoint, put its full URL here */,
        // webSocket: /* optional: false if you want to use polling GET to receive messages. Defaults to true (use WebSocket). */,
        // pollingInterval: /* optional: set polling interval in milliseconds. Default to 1000 */,
    });


    directLine.postActivity({
        from: { id: "2105307782829421" }, // required (from.name is optional)
        type: "event",
        value: "a message for you, Rudy",
        name: "bottonClicked",
    }).subscribe(
        id => console.log("Posted activity, assigned ID ", id),
        error => console.log("Error posting activity", error)
    );
});
