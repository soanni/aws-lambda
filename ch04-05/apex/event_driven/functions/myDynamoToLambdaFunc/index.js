'use strict';
console.log('Loading function');

function isValidIPAddress(ipAddr, cb){
	if(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipAddr)){
		cb(null, "Valid IPv4 Address");
	}else{
		cb("Invalid");
	}
}

function deleteItem(deleteParams, deleteCB){
	var AWS = require('aws-sdk');
	AWS.config.update({
		region: "us-west-2",
		endpoint: "http://dynamodb.us-west-2.amazonaws.com"
	});
	var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
	dynamodb.deleteItem(deleteParams, function(err, data){
		if(err){
			deleteCB(err);
		}else{
			deleteCB(null, data);
		}
	});
}

exports.handler = (event, context, callback) => {
	var util = require('util');
	
	console.log("Reading options from event:\n", util.inspect(event, {depth:5}));
	var ipAddr;
	var eventName;
	var tableName = "LambdaTriggerDB";

	event.Records.forEach((record) => {
		eventName = record.eventName;
		console.log("Event: " + eventName);

		switch(eventName){
			case "MODIFY":
			case "INSERT":
				ipAddr = record.dynamodb.Keys.IP_ADDRESS.S;
				console.log("The IP Address entered is: " + ipAddr);

				isValidIPAddress(ipAddr, function(err, result){
					if(err === "Invalid"){
						console.log("The IP Address is invalid and hence we need to delete the row from the database");

						var deleteParams = {
							Key: {
								"IP_ADDRESS": {
									S: ipAddr
								}
							},
							TableName: tableName
						};
						deleteItem(deleteParams, function(err, data){
							if(err){
								console.log("An error has occured while deleting the Item fro the table: ", err);
								return callback(err);
							}else{
								console.log("The Item was successfully deleted from the table.");
							}
						});
					}else{
						console.log("The IP address is a: " + result);
					}
				});

				break;
			case "REMOVE":
				console.log("Since it's a REMOVE so not doing anything.");
				break;
			default:
				console.log("Something unexpected happened!");
		}
	});
	callback(null, "Item successfully processed");
}