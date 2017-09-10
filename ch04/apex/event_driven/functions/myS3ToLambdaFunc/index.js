var async = require('async');
var AWS = require('aws-sdk');
var gm = require('gm').subClass({imageMagick: true});
var util = require('util');

var s3 = new AWS.S3();

var transformFunc = process.env.TRANSFORM_FUNC;

exports.handler = function(event, context, callback){
	console.log("Reading options from event:\n", util.inspect(event, {depth:5}));
	var srcBucket = event.Records[0].s3.bucket.name;
	var srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
	var dstBucket = srcBucket + "-output";
	var dstKey = "output-" + srcKey;

	if(srcBucket == dstBucket){
		callback("Source and destination buckets are the same");
		return;
	}

	console.log("Finding out the image type");
	var typeMatch = srcKey.match(/\.([^.]*)$/);
	if(!typeMatch){
		callback("Could not determine the image type.");
		return;
	}

	var imageType = typeMatch[1];
	console.log("To keep it simple, we will accept only PNG or JPG image types");
	if(imageType != "jpg" && imageType != "png"){
		callback("Unsupported image type: ${imageType}");
		return;
	}

	async.waterfall([
		function download(next){ 
			s3.getObject({
				Bucket: srcBucket, 
				Key:srcKey
			}, 
			next);
		},
		function transform(response, next){
			console.log("Here we have three options - negative, transparent and gray");
			console.log("Currently we have got the option of " + transformFunc + ".");
			switch(transformFunc){
				case "negative":
					gm(response.Body).negative()
						.toBuffer(imageType, function(err, buffer){
							if(err) {
								next(err);
							} else {
								next(null, response.ContentType, buffer);
							}
						});
					break;
				case "transparent":
					gm(response.Body).colorspace("transparent")
						.toBuffer(imageType, function(err, buffer){
							if(err) {
								next(err);
							} else {
								next(null, response.ContentType, buffer);
							}
						});
					break;
				case "gray":
					gm(response.Body).colorspace("gray")
						.toBuffer(imageType, function(err, buffer){
							if(err) {
								next(err);
							} else {
								next(null, response.ContentType, buffer);
							}
						});
					break;	
				default:
					console.log("None of the three options were selected");
					callback("None of the three options were selected");
					return;				
			}		
		},
		function upload(contentType, data, next) {
			s3.putObject({
				Bucket: dstBucket,
				Key: dstKey,
				Body: data,
				ContentType: contentType
			}, next);
		}
	], function(err){
		if(err){
			console.error(
				'Unable to resize ' + srcBucket + '/' + srcKey +
				' and upload to ' + dstBucket + '/' + dstKey + 
				' due to an error: ' + err
			);
		} else {
			console.log(
				'Successfuly resized ' + srcBucket + '/' + srcKey +
				' and uploaded to ' + dstBucket + '/' + dstKey
			)
		}

		callback(null, "message");
	});
};