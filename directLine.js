import { DirectLine } from "botframework-directlinejs";

var directLine = new DirectLine({
	secret: "KQrRiwONIeo.cwA.5xs.nOqkzHEhFVRPBUjALfuBHR1AAQpy7EZg4yali8JXcSo",
	// token: /* or put your Direct Line token here (supply secret OR token, not both) */,
	// domain: /* optional: if you are not using the default Direct Line endpoint, e.g. if you are using a region-specific endpoint, put its full URL here */,
	// webSocket: /* optional: false if you want to use polling GET to receive messages. Defaults to true (use WebSocket). */,
	// pollingInterval: /* optional: set polling interval in milliseconds. Default to 1000 */,
});


directLine.postActivity({
	from: { id: "2105307782829421"}, // required (from.name is optional)
	type: "message",
	text: "a message for you, Rudy"
}).subscribe(
	id => console.log("Posted activity, assigned ID ", id),
	error => console.log("Error posting activity", error)
);