exports.myHandler = (event, context, callback) => {
	console.log("Starting Lambda Function");
	console.log("value1 = ", event.key1);
	console.log("value2 = ", event.key2);
	console.log("value3 = ", event.key3);
	console.log("remaining time = ", context.getRemainingTimeInMillis());
	console.log('functionName = ', context.functionName);
	console.log('AWSrequestID = ', context.awsRequestId);
	console.log('logGroupName = ', context.logGroupName);
	console.log('logStreamName = ', context.logStreamName);
	switch(event.contextCallbackOption){
		case 'no':
			setTimeout(function(){
				console.log('I am back from my timeout of 30 seconds!!');
			}, 30000);
			break;
		case 'yes':
			console.log("The callback won't wait for the setTimeout() if the callbackWaitsForEmptyEventloop is set to false");
			setTimeout(function(){
				console.log('I am back from my timeout of 30 seconds!!');		
			}, 30000);
			context.callbackWaitsForEmptyEventLoop = false;
			break;
		default:
			console.log("The Default Code Block");	
	}
	callback(null, 'Hello from Lambda');
}