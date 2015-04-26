var _ = require("underscore");

function AppStorage() {
    'use strict'
    this.signedInUsers = [];
    this.activeUsers = [];
    this.chatMessages = [];
}

AppStorage.prototype.savePrivateMessage = function (senderName, receiverName, message, sendTime) {
    'use strict'
    this.chatMessages.push(
        {
            senderName: senderName,
            receiverName: receiverName,
            message: message,
            sendTime: sendTime
        });
}

AppStorage.prototype.loadPrivateMessages = function (senderUsername, receiverUsername) {
    'use strict'
    return _.filter(this.chatMessages, function(el){ return (el.senderName == senderUsername && el.receiverName == receiverUsername) || (el.receiverName == senderUsername && el.senderName == receiverUsername)});
}

AppStorage.prototype.isUserSignedIn = function (username) {
    'use strict'
    return this.signedInUsers.indexOf(username) >= 0;
}

AppStorage.prototype.signInUser = function (username) {
    'use strict'
    this.signedInUsers.push(username);
}

AppStorage.prototype.signOutUser = function (username) {
    'use strict'
    var index = this.signedInUsers.indexOf(username);
    if (index >= 0)
        this.signedInUsers.splice(index, 1);
}

AppStorage.prototype.getActiveUserNames = function (currentName) {
    'use strict'
    return _.map(_.filter(this.activeUsers, function(el) { return el.name != currentName }), function (el) { return el.name });
}

AppStorage.prototype.joinUser = function (socket, name) {
    'use strict'
    this.activeUsers.push({ socket: socket, name: name });
}

AppStorage.prototype.getActiveUserByName = function (username) {
    'use strict'
    for (var i = 0; i < this.activeUsers.length; i++) {
        if (this.activeUsers[i].name == username) {
            return this.activeUsers[i];
        }
    }
}

AppStorage.prototype.disconnectUser = function (socket) {
    'use strict'
    for (var i = 0; i < this.activeUsers.length; i++) {
        if (this.activeUsers[i].socket == socket) {
            var res = this.activeUsers[i].name;
            this.activeUsers.splice(i, 1);
            return res;
        }
    }
}

module.exports = new AppStorage();
