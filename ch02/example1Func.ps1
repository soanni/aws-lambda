 zip -r ch02Example1Function.zip example1.js

 aws lambda create-function --region us-west-2 `
	--function-name ch02Example1Function `
	--zip-file fileb://ch02Example1Function.zip `
	--role arn:aws:iam::003550747411:role/basic-lambda-role `
	--handler example1.myHandler `
	--runtime nodejs4.3 `
	--memory-size 128