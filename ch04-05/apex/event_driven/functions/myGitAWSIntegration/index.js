'use strict';

const request = require('request');
const AWS = require('aws-sdk');
const company = process.env.teamworkCompany;
const kmsEncryptedAPIKey = process.env.kmsEncryptedAPIKey;
const taskListID = process.env.taskListID;
let teamworkAPIKey;

function createTask(githubEvent, callback){
	let taskName = githubEvent.issue.title;
	let path = "/tasklists/" + taskListID + "/tasks.json";
	let date = new Date();
	let month = date.getMonth();
	let day = date.getDate();
	let endDate = date.getFullYear() + ((month+2) < 10 ? '0' : '') + (day < 10 ? '0' : '') + day;
	let startDate = date.getFullYear() + ((month+1) < 10 ? '0' : '') + (day < 10 ? '0' : '') + day;

	let base64 = new Buffer(teamworkAPIKey + ':xxx').toString("base64");
	let json = {"todo-item": {"content": taskName, "startdate": startDate, "enddate": endDate}};
	let options = {
		uri: "https://" + company + ".teamwork.com" + path,
		hostname: company + ".teamwork.com",
		method: "POST",
		encoding: "utf8",
		followRedirect: true,
		headers: {
			"Authorization": "BASIC " + base64,
			"Content-Type": "application/json"
		},
		json: json
	};
	request(options, function(error, res, body){
		//console.log(res);
		if(error){
			console.error("Request Error: " + error);
			callback(error);
		}else{
			console.log("STATUS: " + res.statusCode);
			res.setEncoding("utf8");
			console.log("body: " + body);
			callback(null, "Task Created!");	
		}
	});
}

exports.handler = function(event, context, callback){
	let githubEvent = JSON.parse(event.Records[0].Sns.Message);
	console.log('Received GitHub event:', githubEvent);

	if(!githubEvent.hasOwnProperty('issue') || githubEvent.action != 'opened'){
		var msg = "Event isn't for issue opening!";
		console.log(msg);
		callback(null, msg);
	}else{
		console.log("Issue was opened!");
		if(teamworkAPIKey){
			createTask(githubEvent, callback);
		}else if(kmsEncryptedAPIKey	&& kmsEncryptedAPIKey !== '<kmsEncryptedAPIKey>'){
			const encryptedBuf = new Buffer(kmsEncryptedAPIKey,	'base64');
			const cipherText = { CiphertextBlob: encryptedBuf };
			const kms = new AWS.KMS();
			kms.decrypt(cipherText, (err, data) => {
				if(err){
					console.log('Decrypt error:', err);
					return callback(err);
				}
				teamworkAPIKey = data.Plaintext.toString('ascii');
				createTask(githubEvent, callback);
			});
		}else{
			var msg = "API Key has not been set.";
			console.error(msg);
			callback(msg);
		}

	}
};