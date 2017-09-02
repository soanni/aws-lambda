exports.myHandler = (event, context, callback) => {
	console.log("Starting the " + context.functionName + " Lambda Function");
	console.log("The event we pass will have two numbers and an operand value");
	// operand can be +, -, /, *, add, sub, mul, div
	console.log("Received event:", JSON.stringify(event, null, 2));
	var error, result;
	if (isNaN(event.num1) || isNaN(event.num2)) {
		console.error("Invalid numbers");
		//different logging
		error = new Error("Invalid Numbers!");
		//exception handling
		callback(error);		
	}
	switch(event.operand) {
		case "+":
		case "add":
			result = event.num1 + event.num2;
			break;
		case "-":
		case "sub":
			result = event.num1 - event.num2;
			break;
		case "*":
		case "mul":
			result = event.num1 * event.num2;
			break;
		case "/":
		case "div":
			if(event.num2 == 0){
				console.error("The divisor cannot be 0");
				error = new Error("the divisor cannot be 0");
				callback(error, null);			
			}else{
				result = event.num1/event.num2;	
			}
			break;
		default:
			callback("Invalid Operand");
			break;		
	}
	console.log("The Result is: " + result);
	callback(null, result);
}