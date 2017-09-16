console.log("Loading function");

function publish(snsParams, publishCB){
	var AWS = require('aws-sdk');
	AWS.config.update({
		region: 'us-west-2',
		endpoint: 'sns.us-west-2.amazonaws.com'
	});
	var sns = new AWS.SNS({apiVersion: '2010-03-31'});
	sns.publish(snsParams, function(err, data){
		if(err){
			publishCB(err);
		}else{
			publishCB(null, "SNS sent successfully");
		}
	});
}

exports.handler = function(event, context, cb){
	event.Records.forEach(function(record){
		var snsTopicArn = "arn:aws:sns:us-west-2:003550747411:kinesisLambdaTest";
		var payload = new Buffer(record.kinesis.data, 'base64').toString('ascii');
		console.log("Decoded error log is: ", payload);
		console.log("Sending SNS topic - Alert to andrey.solodov@aurea.com");
		var snsParams = {
			Message: payload,
			Subject: 'HTTP Error',
			TopicArn: snsTopicArn
		};
		publish(snsParams, function(snsErr, snsVal){
			if(snsErr){
				console.log("Error in publishing SNS Alert: ", snsErr);
				cb(snsErr);
			}else{
				console.log(snsVal);
				cb(null, snsVal);
			}
		});
	});
};