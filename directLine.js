var DirectLine = require("botframework-directlinejs").DirectLine;
var dotenv = require("dotenv");
dotenv.config();


function postDirectLineEvent(eventValue, eventName, userId){
	var directLine = new DirectLine({
		secret: process.env.DIRECTLINE_SECRET,
	});
	directLine.postActivity({
		//USER ID HAS TO BE SET BEFORE!
		from: { id: userId },
		type: "event",
		value: eventValue,
		name: eventName,
	}).subscribe(
		id => console.log("Posted activity, assigned ID ", id),
		error => console.log("Error posting activity", error)
	);
	console.log("Direct line event created");
	
}
module.exports.postDirectLineEvent = postDirectLineEvent;  