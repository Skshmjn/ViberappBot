var app = require('express')();
var request = require('request');
const http = require('http').Server(app);
const io = require('socket.io')(http,{ 
  cookie: false,origins: '*:*'});

var TextMessage = require('viber-bot').Message.Text;

const ViberBot = require('viber-bot').Bot;
const BotEvents = require('viber-bot').Events;


app.enable('trust proxy');
const {Datastore} = require('@google-cloud/datastore');

// DATASTORE START

const datastore = new Datastore();

const saveMessage = data => {
  return datastore.save({
    key: datastore.key('Messages'),
    data: data,
  });
};


const saveUsers = data => {
  return datastore.save({
    key: datastore.key('Users'),
    data: data,
  });
};

// DATASTORE METHODS END

app.get('/', (req, res) => {
  return res.send('Received a GET HTTP method');
});
 


// BOT START

const bot = new ViberBot({
  authToken: authtoken ,
  name: "Jumpe Bot",
  avatar: "https://paganresearch.io/images/Square.jpg"
});

app.use("/viber/webhook", bot.middleware());

bot.on(BotEvents.SUBSCRIBED, response => {
  response.send(new TextMessage(`Hi there ${response.userProfile.name}. I am ${bot.name}! Type "LEN:" before text to know the charaters in textS.`));
  userData = {"id":response.userProfile.id,"name":response.userProfile.name}
  saveUsers(userData);
});


bot.on(BotEvents.MESSAGE_RECEIVED, (message, response) => {
  if(message.text.substring(0,4)==="LEN:"){
    response.send(new TextMessage(""+message.text.length-4));
  }
  messageData = {"user":response.userProfile.id,
"in/out":"in","timestamp":message.timestamp,"text":message.text,"token":message.token}


  saveMessage(messageData);

  io.to(response.userProfile.id).emit('chat message', response.userProfile.name+" : "+ message.text);
});


// BOT END 


// SOCKET SERVER START

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('joined', (msg) => {
    console.log(msg.room)
    socket.join(msg.room)
    io.to(msg.room).emit('chat message',"you_joined:"+ msg.room);
    console.log('join------>: ' + msg.room);
  });

  socket.on('chat message', (msg) => {


  
    request({
    url: "https://chatapi.viber.com/pa/send_message",
    method: "POST",
    json: true,  
    body: {
      "receiver":msg.room,
      "min_api_version":1,
      "sender":{
         "name":bot.name,
         "avatar":bot.avatar
      },
      "tracking_data":"tracking data",
      "type":"text",
      "text":msg.text
},
    headers:{'X-Viber-Auth-Token' : bot.authToken}
}, function (error, response, body){
    console.log(response);
});

    messageData = {"user":msg.room,
    "in/out":"out","timestamp":new Date().getTime(),"text":msg.text}

    saveMessage(messageData);
  
  
    io.to(msg.room).emit('chat message',"you:"+ msg.text);
    console.log('message: ' + msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// SOCKET SERVER END

// RUNSERVER
if (module === require.main) {

  
  const PORT = process.env.PORT || 8080;
  http.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.'); 
    bot.setWebhook(webhook complete url).catch(error => {
      console.log('Can not set webhook on following server. Is it running?');
      console.error(error);
      process.exit(1);
    });
    
    });
}

module.exports = http;
