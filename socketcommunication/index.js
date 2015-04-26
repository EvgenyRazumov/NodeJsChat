var app = require('../app');
var appStorage = require('../appstorage');

function SocketCommunication(){
}

SocketCommunication.prototype.initialize = function () {
    'use strict'
    app.io.on('connection', function(socket){
        socket.on('join user', function(userName){
            appStorage.joinUser(socket, userName);
            app.io.emit('user joined', userName);
        });
        socket.on('send message', function(msg){
            app.io.emit('message added', msg);
        });
        socket.on('send private message', function(msg){
            appStorage.savePrivateMessage(msg.senderName, msg.receiverName, msg.message, msg.sendTime);

            //send to specific clients
            var senderUser = appStorage.getActiveUserByName(msg.senderName);
            var receiverUser = appStorage.getActiveUserByName(msg.receiverName);

            if (senderUser)
                app.io.sockets.connected[senderUser.socket.id].emit('private message added', msg);
            if (receiverUser)
                app.io.sockets.connected[receiverUser.socket.id].emit('private message added', msg);
        });
        socket.on('disconnect', function(){
            var username = appStorage.disconnectUser(socket);
            if (username)
                app.io.emit("user left", username);
        });
    });

}

module.exports = new SocketCommunication();