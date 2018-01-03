//Authorisation link
//https://discordapp.com/oauth2/authorize?client_id=[BOT_ID]&scope=bot&permissions=0
var Discord = require('discord.js');
var request = require('request');
var fs = require('fs');

var bot = new Discord.Client();
var isReady = false;

var guildName = "GUILDNAME";
var serverName = "REALMNAME";
var region = "EU";
var warcraftLogsApiKey = "WCLAPIKEY"

var notificationChannelId = "CHANNELID"

var url = "https://www.warcraftlogs.com:443/v1/reports/guild/" + guildName + "/" + serverName + "/" + region + "?api_key=" + warcraftLogsApiKey;

var logs;
setInterval(function() {
	request.get({
		url: url,
		json: true,
		headers: {'User-Agent': 'request'}
	  }, (err, res, data) => {
		if (err) {
			console.log('Error:', err);
		} else if (res.statusCode !== 200) {
			console.log('Status:', res.statusCode);
		} else {
			// data is already parsed as JSON:
			logs = data;

			var oldLogs = fs.readFileSync('logs.json','utf8')
			if (oldLogs !== JSON.stringify(logs)) {
				postLogNotification(logs[logs.length-1]);
				saveLogsToFile();
			}


		}
	});
},60000)


bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`);
    isReady = true;
});

function saveLogsToFile() {
	console.log("Writing Logs to file ...")
	fs.writeFile("logs.json", JSON.stringify(logs), function(err) {
		if(err) {
			return console.log("File write error" + err);
		}

		console.log("File write successful");
	});
}

function postLogNotification(log) {
	var startDate = new Date(log.start);
	console.log(log)
	var messageString = startDate.getFullYear() + "-" + (startDate.getMonth()+1) + "-" + startDate.getDate();
	messageString += " **" + log.title + "**\n";
	messageString += "https://www.warcraftlogs.com/reports/" + log.id;
	bot.channels.get(notificationChannelId).send(messageString);
}

bot.login('BOTLOGINTOKEN');