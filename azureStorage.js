// more samples here https://github.com/Azure-Samples/documentdb-node-getting-started/blob/master/app.js
var documentClient = require("documentdb").DocumentClient;
var dotenv = require("dotenv");
dotenv.config();

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
/* eslint disable-next-line */
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
async function writeValue(para_documentId, key, hasSubkey, subkey, value) {
	try {
		let oldDocument = await getDocument(para_documentId);
		if(hasSubkey){
			if(!oldDocument.data[key]){
				oldDocument.data[key]= {};
				oldDocument.data[key][subkey] = value;
			}else{
				// let completeKey = `${key}.${subkey}`;
				console.log("subkey is"+subkey);
				oldDocument.data[key][subkey] = value;
			}
		}else{
			oldDocument.data[key] = value;
		}
		let docAfterReplacing = await replaceDocument(para_documentId, oldDocument);
		console.log("This is updated document: " + "\n" + JSON.stringify(docAfterReplacing));
		return docAfterReplacing;
	} catch (err) {
		return err;
	}
}

module.exports.getDocument = getDocument;  
module.exports.writeValue = writeValue;  
module.exports.getValue = getValue;  
module.exports.replaceDocument = replaceDocument;  