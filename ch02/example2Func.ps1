 zip -r ch02Example2Function.zip example2.js

 aws lambda create-function --region us-west-2 `
	--function-name ch02Example2Function `
	--zip-file fileb://ch02Example2Function.zip `
	--role arn:aws:iam::003550747411:role/basic-lambda-role `
	--handler example2.myHandler `
	--runtime nodejs4.3 `
	--timeout 60 `
	--memory-size 128