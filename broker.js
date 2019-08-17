const mosca = require('mosca');
const mongoose = require("mongoose");
const httpServer = require('http').createServer();

const settings = {
		port:1338
		}
const db = require("./config/db").mongoURI;

//Connect to MongoDB
mongoose
  .connect(db, {
    useNewUrlParser: true
  })
  .then(() => {
    console.group("MongoDB Connected !");
  })
  .catch(err => {
    console.log(err);
  });

const server = new mosca.Server(settings);
server.attachHttpServer(httpServer);
httpServer.listen(1890);

let clients = [];
const Channel = require("./db_models/channels");

server.on('ready', function(){
console.log("Broker Ready");
});

server.on("error", function (err) {
	console.log(err);
});

server.on('clientConnected', function (client) {
	console.log('Client Connected \t:= ', client.id, '\n\n\n');
	clients.push(client);
	printClients();
});

server.on('published', function (packet, client) {
	const {topic, payload} = packet;
	const message = payload.toString();
	//const contex = message.toString();
	//console.log(client);
	Channel.findOne({topic},(err,channel)=>{
		if(!err && channel )
		{
			if(!topic.includes("$SYS")){
				updateChannel(channel,message);
			}
		}
		else
		{
			if(!topic.includes("$SYS")){
				createChannel(topic);
			}		
		}
	}).then(()=>{
	}).catch(err=>console.log("ERROR Saving to db ",err.message))
});

server.on('subscribed', function (topic, client) {

	if(!topic.includes("$SYS")){
		Channel.findOne({topic},(err,channel)=>{
			if(!err && channel )
			{
				addSubscriber(channel,client.id);
			}
			else
			{
				console.log("client [ ",client.id,"] trying to subscribe to ",topic);
			}
		}).then(()=>{
		}).catch(err=>console.log("ERROR Saving to db ",err.message));
	}
	
});

server.on('unsubscribed', function (topic, client) {
	//console.log('unsubscribed := ', topic);
});

server.on('clientDisconnecting', function (client) {
	console.log('clientDisconnecting := ', client.id);
});

server.on('clientDisconnected', function (client) {
	console.log('Client Disconnected     := ', client.id , '\n\n\n');
	let newclients = [];
	clients.forEach(c => {
		if(c.id != client.id)
		{
			newclients.push(c);
		}
	});

	clients = newclients;

	printClients();
});

function printClients()
{
	console.log("Clients List : ==============")
	clients.forEach(client=>{
		console.log(client.id)
	});
	console.log("=============================\n\n\n")
}

//************************** DB Functions ************************************/
const createChannel = (topic) =>
{

	console.log("creating : ",topic);
	Channel({
		topic
	}).save().catch(err=>console.log(err.message))
}

const updateChannel = (channel,message) =>
{
	channel.dt_last = Date.now();
	channel.preview = message;
	channel.save().then().catch(err=>console.log(err.message));
}

const addSubscriber = (channel,sub) =>
{
	let i = channel.subscribers.indexOf(sub);
	if(i === -1)
	{
		channel.subscribers.push(sub);
		channel.save().then().catch(err=>console.log(err.message));
	}
}