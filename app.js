"use strict";
//https://flinkbot-webview-win.azurewebsites.net/

// https://flinkbot-webview-win.azurewebsites.net/claimObjects?2105307782829421=&fb_iframe_origin=https%3A%2F%2Fwww.messenger.com


//my facebook id for testing: 2105307782829421
// EJS express node turorial https://codeburst.io/build-a-weather-website-in-30-minutes-with-node-js-express-openweather-a317f904897b
// vscode: shift option f to beautify
var url = require("url");
var dotenv = require("dotenv");
dotenv.config();
var bodyParser = require("body-parser");
var request = require("request");
//to make directLine to send data to bot work https://github.com/microsoft/botframework-DirectLinejs
global.XMLHttpRequest = require("xhr2");
var express = require("express");
var app = express();
var azureStorage = require("./azureStorage");
var directLine = require("./directLine");

// expose the public folder so it can be used.
app.use(express.static("public"));
// use body Parser middleware to get variables submitted (req.body)
app.use(bodyParser.urlencoded({ extended: true }));
//use EJS (no require needed)
app.set("view engine", "ejs");

// use like this http://localhost:3000/login?userId=I1KJ4DNAAEP
let userId;
let currentClaimName;
let claimPriceType;
function setUserId(para_req) {
	userId = para_req.query.userId;
	console.log("This is the user id of the current user: "+ userId);
}
function setCurrentClaimName(para_req) {
	currentClaimName = para_req.query.currentClaimName;
}
function setClaimPriceType(para_req) {
	claimPriceType = para_req.query.claimPriceType;
	// claimPriceType = "liability";
}

app.listen(process.env.PORT || 3000, function () {
	console.log("App started and listening on port 3000!");
});






/**
 * ROOT
 */
app.get("/", function (req, res) {
	res.send("Go away! There is nothing here at the moment!");
});

/**
 * LOGIN: Handle login, save token in azure database
 */
app.get("/login", function (req, res) {
	setUserId(req);
	// userId = req.query("userId");
	// userId = userId.substr(0, 16);
	res.render("loginPage", { error: null, userId: `this is your user Id: ${userId}` });
});
app.post("/login", function (req, res) {
	var email = req.body.email;
	var password = req.body.password;
	var options = {
		method: "POST",
		url: "https://test.goflink.ch/api/v1/auth",
		headers: { "Content-Type": "application/json" },
		body: { username: email, password: password },
		json: true
	};
	request(options, function (error, response, body) {
		if (error) {
			throw new Error(error);
		}
		else {
			console.log("the user Id is: " + userId);
			if (!body.error) {
				azureStorage.writeValue(`${userId},userData`, "authToken", body);
				directLine.postDirectLineEvent("User successfully logged in to Flink", "loginSuccessful", userId);
				res.render("closeWebview");
			}
			res.render("loginPage", { error: "Login failed, please try again", username: "there is the useridbla" });
		}
		console.log(body);
	});
});

/**
 * CLAIMS: The claims object and post them on database.
 * https://flinkbot-webview-win.azurewebsites.net/claimObjects?userId=2105307782829421&currentClaimName=claim1
 * * localhost:3000/claimObjects?userId=2105307782829421&currentClaimName=claim1
 */


app.post("/claimObjects", function (req, res) {
	var claimObjects = cleanObject(req.body);

	console.log(`req.body is: ${JSON.stringify(claimObjects)}`);
	for (var damageObjectKey in claimObjects){
		// console.log(`key is: ${damageObjectKey} values is ${claimObjects[damageObjectKey]}`);
		azureStorage.writeValue(`${userId},userData`, currentClaimName, true, damageObjectKey, claimObjects[damageObjectKey]);
	}
	directLine.postDirectLineEvent("User filled out the damaged objects", "claimObjectsSuccessful", userId);
	res.render("closeWebview");
});

function cleanObject(obj) {
	for (var propName in obj) {
		if (obj[propName] === null || obj[propName] === undefined || obj[propName] === "") {
			delete obj[propName];
		}
	}
	return obj;
}

app.get("/claimObjects", function (req, res) {
	setUserId(req);
	setCurrentClaimName(req);
	setClaimPriceType(req);
	console.log("this is the current claim name: " + currentClaimName);
	res.render("claimObjectsStatic", { claimPriceType: claimPriceType });
});






/**
 * TESTS: The claims object and post them on database..
 */
// app.get("/testEvent", function (req, res) {
// 	// https://flinkbot-webview-win.azurewebsites.net/testEvent?default-user
// 	setUserId(req);
// 	directLine.postDirectLineEvent("test", "testname", "2105307782829421");
// });
// app.get("/testParam", function (req, res) {
// 	//  = req.query("userId");
// 	// userId = userId.substr(0, 16);
// 	let id = req.query.id;
// 	let token = req.query.token;

// 	res.send(`Those are your params ${req.query.id} and ${req.query.token} and ${req.query}`);
// });