var GitHubApi = require("github");
var github = new GitHubApi({version: "3.0.0"});
var gitToken = process.env.gitToken;
github.authenticate({type:"oauth", token: gitToken});

github.repos.createHook({
	owner: process.env.owner,
	user: process.env.user,
	repo: process.env.repoName,
	name: "amazonsns",
	config: {
		"aws_key": process.env.AWS_ACCESS_KEY_ID,
		"aws_secret": process.env.AWS_SECRET_ACCESS_KEY,
		"sns_topic": process.env.snsTopicARN,
		"sns_region": process.env.AWS_SNS_REGION || "us-west-2"
	},
	events: ["pull_request", "issues"]
}, function(err, result){
	console.log(arguments);
});