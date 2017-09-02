exports.myHandler = function(event, context, callback) {
	console.log("value = " + event.key);
	console.log("functionName = ", context.functionName);
	callback(null, "Smth worked!");
}