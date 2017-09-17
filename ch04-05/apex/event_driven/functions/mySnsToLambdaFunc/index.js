'use strict';
console.log('Loading function');

function getMessageHash(message, hashCB){
	if(message === ""){
		return hashCB("Message is empty");
	}else if((message === null) || (message === undefined)){
		return hashCB("Message is null or undefined");
	}else{
		var crypto = require('crypto');
		var messageHash = crypto.createHash('md5').update(message).digest("hex");
		return hashCB(null, messageHash.slice(0,10));
	}
}

function insertItem(insertParams, insertCB){
	var AWS = require('aws-sdk');
	AWS.config.update({
		region: "us-west-2",
		endpoint: "http://dynamodb.us-west-2.amazonaws.com"
	});
	var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
	dynamodb.putItem(insertParams, function(err, data){
		if(err){
			insertCB(err);
		}else{
			insertCB(null, data);
		}
	});
}

exports.handler = (event, context, callback) => {
	var util = require('util');
	console.log("Reading options from event:\n", util.inspect(event, {depth:5}));

	var tableName = "LambdaTriggerSNS";
	var message, recordVal;

	event.Records.forEach((record) => {
		message = record.Sns.Message;
		console.log("Message received from SNS Topic: " + message);
		console.log("Generating md5 hash of the message and taking first 10 characters");
		getMessageHash(message, function(hashErr, hashData){
			if(hashErr){
				console.log(hashErr);
				return callback(hashErr);
			}else{
				console.log("The first 10 characters of the md5 hash generated are: " + hashData);
				recordVal = hashData;
				console.log("Inserting the data in " + tableName + " table.");
				var insertParams = {
					Item: {
						"username": {
							S: recordVal
						}
					},
					TableName: tableName
				};
				insertItem(insertParams, function(insertErr, insertData){
					if(insertErr){
						console.log("An error occured while inserting into the db: ", insertErr);
						return callback(insertErr);
					}else{
						console.log("Record was successfully added to the db.");
						return callback(null, "Success");
					}
				});
			}
		});
	});
}