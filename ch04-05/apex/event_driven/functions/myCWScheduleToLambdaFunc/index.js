console.log("Loading function");
exports.handler = function(event, context, cb){
	var csvExport = require('dynamodbexportcsv');
	var exporter = new csvExport(null, null, 'us-west-2');

	exporter.exportTable('LambdaExportToS3', ['username'], 1, true, 250, 'soanni-dynamodb-backup-s3', '09-14-2017', function(err){
		if(err){
			console.log("An error occurred while exporting the table to s3. The error is: " + err);
			return cb(err);
		}
		console.log("Successfully exported the table to s3");
		cb(null, "success");
	});
};