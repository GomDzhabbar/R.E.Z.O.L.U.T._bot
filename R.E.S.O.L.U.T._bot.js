var cfg     = require('./config.json');
var Discord = require('discord.js');
var strophe = require('node-strophe').Strophe;
var Strophe = strophe.Strophe;

console.log(cfg);

if ( !cfg ) {
   console.log('Ошибка загрузки файла конфигурации.');
   return;
}

var login = cfg.login;
var pass  = cfg.pass;

// Идендификатор бота добавленного в Дискорд
var idDiscordBot  = cfg.idDiscordBot;
// С какого канала ожидать сообщение all@broadcast.redalliance.pw
var listenChannel = cfg.listenChannel;
// Идендификатор канала куда надо отправить сообщение из jabber 
var idChannel     = cfg.idChannel;

const client      = new Discord.Client();

if ( !login || !pass || !idDiscordBot || !listenChannel || !idChannel ) {
   console.log('Не заданны все необходимые настройки!');
   return;
}

var onConnect = function(status) {
   if (status == Strophe.Status.CONNECTING) {
      console.log('CONNECTING');
   } else if (status == Strophe.Status.CONNFAIL) {
      console.log('CONNFAIL');
   } else if (status == Strophe.Status.DISCONNECTING) {
      console.log('DISCONNECTING');
   } else if (status == Strophe.Status.DISCONNECTED) {
      console.log('DISCONNECTED');
   } else if (status == Strophe.Status.CONNECTED) {
      console.log("CONNECT ok");

      function onMessage(msgXML) {
         var to = msgXML.getAttribute('to');
         var from = msgXML.getAttribute('from');
         var fromBareJid = Strophe.getBareJidFromJid(from);
         var type = msgXML.getAttribute('type');
         var elems = msgXML.getElementsByTagName('body');
         var body = elems[0]
         var text = Strophe.getText(body);

         if ( from && from.indexOf(listenChannel) !== -1 ) {
            console.log('-- new mwssage --');
            console.log('from: ' + from);
            console.log('text: ' + text)
            console.log('-----------------');

            if ( text ) {
               try {
                  var channel = client.channels.find('id', idChannel);
                  channel.sendMessage(text);
               } catch (error) {
                  console.log(error);
               } 
            }
         }

         return true;   
      };

      try {
         connection.addHandler(
            onMessage,
            'jabber:client',
            'message',
            null,
            null,
            null,
            { 'matchBareFromJid': true });
         connection.send(strophe['$pres']().tree());
      } catch (error) {
         console.log(error);
      }
   }
};

function sendMsg(to_jid, msg) {
   try {
      console.log('начинаю отправлено');
      var uniqueID = connection.getUniqueId(); 
      var reqChannelsItems = strophe['$msg']({"id":uniqueID, "to":to_jid}).c("body").t(msg);

      connection.sendIQ(reqChannelsItems.tree(), function(res){
         console.log('Сообщение отправлено');
      },function() {
         console.log('Ошибка отправки');
      }); 
   } catch (error) {
      console.log(error);
   }
}

client.on('message', message => {
   console.log('сообщение из канала ' + message.channel.id);
});

client.login(idDiscordBot);

try {
   console.log("--start--");
   connection = new Strophe.Connection("https://conversejs.org/http-bind/", {keepalive:true});
   connection.connect(login, pass, onConnect);
} catch (error) {
   console.log(error);
}
