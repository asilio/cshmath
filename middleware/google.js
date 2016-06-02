var google=require("googleapis");

var OAuth2=google.auth.OAuth2;
var plus=google.plus('v1');
var gmail=google.gmail('v1');
var calendar=google.calendar('v3');

var CLIENT_ID="904507108548-7dqcigbatq9qmlu23lcgp7ujspb7sjm4.apps.googleusercontent.com";
var CLIENT_SECRET="OIWiiIvX_gSAHuO6iRc5gDqd";
var REDIRECT_URL="http://localhost:8080/login/oauth2";
//var REDIRECT_URL="http://localhost/oauth2callback"

var oauth2Client= new OAuth2(CLIENT_ID,CLIENT_SECRET,REDIRECT_URL);
var scopes=[
"https://www.googleapis.com/auth/plus.login",
"email",
"https://www.googleapis.com/auth/calendar"
];

var url = oauth2Client.generateAuthUrl({
  scope: scopes // If you only need one scope you can pass it as string
});

module.exports={
	url:url,
	oauth2Client:oauth2Client,
	plus:plus,
	gmail:gmail,
	calendar:calendar,
}