var DirectLine = require("botframework-directlinejs").DirectLine;


function postDirectLineEvent(eventValue, eventName, userId){
	var directLine = new DirectLine({
		secret: "KQrRiwONIeo.cwA.5xs.nOqkzHEhFVRPBUjALfuBHR1AAQpy7EZg4yali8JXcSo",
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
}
module.exports.postDirectLineEvent = postDirectLineEvent;  