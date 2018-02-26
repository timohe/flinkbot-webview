"use strict";
// EJS express node turorial https://codeburst.io/build-a-weather-website-in-30-minutes-with-node-js-express-openweather-a317f904897b
// vscode: shift option f to beautify
var url = require("url");
var restify = require("restify");
var dotenv = require("dotenv");
dotenv.config();
var bodyParser = require("body-parser");
var request = require("request");
var DirectLine = require("botframework-directlinejs").DirectLine;
//to make directLine to send data to bot work https://github.com/microsoft/botframework-DirectLinejs
global.XMLHttpRequest = require("xhr2");
var express = require("express");
var app = express();
var azureStorage = require("azureStorage.js");


// expose the public folder so it can be used.
app.use(express.static("public"));
// use body Parser middleware to get variables submitted (req.body)
app.use(bodyParser.urlencoded({ extended: true }));
//use EJS (no require needed)
app.set("view engine", "ejs");

var userId;
function setUserId(para_req) {
	userId = para_req.query("userId");
	if (userId.substr(0, 12) == "default-user") {
		userId = "default-user";
	} else {
		userId = userId.substr(0, 16);
	}
}
// use like this http://localhost:3000/login?userId=I1KJ4DNAAEP

/**
 * Handle login, save token in azure database
 */
app.get("/", function (req, res) {
	res.send("Go away! There is nothing here at the moment!");
});
/**
 * Handle login, save token in azure database
 */
app.get("/login", function (req, res) {
	userId = req.query("userId");
	userId = userId.substr(0, 16);
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
			console.log("the user Id is" + userId);
			if (!body.error) {
				azureStorage.writeValue(`${userId},userData`, "authToken", body);
				res.redirect("/loginSuccess");
			}
			res.render("loginPage", { error: "Login failed, please try again", username: "there is the useridbla" });
		}
		console.log(body);
	});

});

app.get("/loginSuccess", function (req, res) {
	var directLine = new DirectLine({
		secret: "KQrRiwONIeo.cwA.5xs.nOqkzHEhFVRPBUjALfuBHR1AAQpy7EZg4yali8JXcSo",
		// token: /* or put your Direct Line token here (supply secret OR token, not both) */,
		// domain: /* optional: if you are not using the default Direct Line endpoint, e.g. if you are using a region-specific endpoint, put its full URL here */,
		// webSocket: /* optional: false if you want to use polling GET to receive messages. Defaults to true (use WebSocket). */,
		// pollingInterval: /* optional: set polling interval in milliseconds. Default to 1000 */,
	});
	directLine.postActivity({
		//USER ID HAS TO BE SET BEFORE!
		from: { id: userId }, // required (from.name is optional)
		type: "event",
		value: "User successfully logged in to Flink",
		name: "loginSuccessful",
	}).subscribe(
		id => console.log("Posted activity, assigned ID ", id),
		error => console.log("Error posting activity", error)
	);
	res.render("loginPage_success", { closeWebview: true });
});

/**
 * The claims object and post them on database..
 */
//set user id

app.get("/claimObjects", function (req, res) {
	userId = req.query("userId");
	userId = userId.substr(0, 16);
	res.render("claimObjects");
});
app.post("/claimObjects", function (req, res) {

	var objectName1 = req.body.object1;
	var objectPrice1 = req.body.price1;

	azureStorage.writeValue(`${userId},userData`, "claim_object1", objectName1);
	azureStorage.writeValue(`${userId},userData`, "claim_price1", objectPrice1);
});

app.get("/claimObjects", function (req, res) {
	setUserId(req);
	res.render("claimObjects");
});

app.listen(process.env.PORT || 3000, function () {
	console.log("App started and listening on port 3000!");
	//   console.log(process.versions)
});





