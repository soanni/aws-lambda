const AWS = require('aws-sdk');
AWS.config.update({
	region: 'us-west-2',
	maxRetries: 20
});
const lambda = new AWS.Lambda({apiVersion: '2015-03-31'});
const prompt = require('prompt');
console.log("Greetings!!");
console.log("Please enter the city name for weather updates.");
prompt.start();
prompt.get(['city'], function(err, result){
	console.log('Command-line input received:');
	console.log('city: ' + result.city);
	var event = "{\"city\":\"" + result.city + "\"}";
	var params = {
		FunctionName: "eventDriven_myWeatherLambda",
		InvocationType: "Event",
		Payload: event
	};
	lambda.invoke(params, function(err, data){
		if(err) console.log(err, err.stack);
		else console.log(data);
	});
});