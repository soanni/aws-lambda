 zip -r ch02CalcFunction.zip calculator.js

 aws lambda create-function --region us-west-2 `
	--function-name ch02CalcFunction `
	--zip-file fileb://ch02CalcFunction.zip `
	--role arn:aws:iam::003550747411:role/basic-lambda-role `
	--handler calculator.myHandler `
	--runtime nodejs4.3 `
	--memory-size 128