$(document).ready(function() {
    socket.emit('join user', chatConfiguration.currentUsername);
    socket.on('user joined', function(username){
        if (username != chatConfiguration.currentUsername) {
            $('#user-list').append($('#user-line-template').clone().html().replace(/{username}/g, username));
        }
    });
    socket.on('user left', function(username){
        if (username == chatConfiguration.currentUsername)
            window.location.href = '/';

        $('li[data-user="' + username + '"]').remove();
    });
    socket.on('message added', function(msg){
        addMessageToChat($('.message-container'), msg.name, msg.message, msg.sendTime);
    });
    socket.on('private message added', function(msg){
        if (chatConfiguration.privateChatReceiver == msg.senderName || chatConfiguration.privateChatReceiver == msg.receiverName) {
            addMessageToChat(chatConfiguration.privateChatPopup.find('.private-message-container'), msg.senderName, msg.message, msg.sendTime);
        } else {
            $('.new-messages[data-user="' + msg.senderName + '"]').removeClass('hidden');
        }
    });
});

$(document).on('submit', '#send-private-message-form', function(){
    var message = $('#private-message').val();
    if (!message)
        return false;

    socket.emit('send private message',
            {
                senderName: chatConfiguration.currentUsername,
                receiverName: $('#receiver-username').val(),
                message: message,
                sendTime: new Date()
            });
    $('#private-message').val('');
    return false;
});

$(document).on('submit', '#send-message-form', function(){
    var message = $('#message').val();
    if (!message)
        return false;

    socket.emit('send message', { name: chatConfiguration.currentUsername, message: message, sendTime: new Date() });
    $('#message').val('');
    return false;
});

$(document).on('click', '.private-chat-link', function(){
    var receiverUsername = $(this).data('user');
    $.ajax({
        url: "/chat/loadPrivateMessages",
        data: {
            user: receiverUsername
        },
        context: this,
        success: function(data){
            privateChatLoaded(receiverUsername, data);
        },
        error: function(){
            alert('Something went wrong');
        }
    })
    return false;
});

//helpers
function htmlEncode(value){
    return value.replace('<', '&lt;').replace('>', '&gt;');
}

function scrollChatToTheLatestMessage(messageContainer){
    messageContainer.scrollTop(messageContainer[0].scrollHeight);
}

function addMessageToChat(messageContainer, username, message, sendTime){
    var isYourOwnMessage = username == chatConfiguration.currentUsername;
    var item = $('#message-line-template').clone().html().replace('{username}', isYourOwnMessage ? "Your message" : username)
            .replace('{message}', htmlEncode(message))
            .replace('{message-class}', isYourOwnMessage ? "your-message" : "other-message")
            .replace('{time}', new Date(sendTime).toLocaleString());

    messageContainer.find('.message-list').append(item);
    scrollChatToTheLatestMessage(messageContainer);
}

function privateChatLoaded(receiverUsername, data){
    var item = $('#private-chat-dialog-template').clone().html().replace(/{username}/g, receiverUsername);
    var $item = $(item);

    $item.find('.send-private-message-form').attr('id', 'send-private-message-form').removeClass('send-private-message-form');
    $item.find('.private-message').attr('id', 'private-message').removeClass('private-message');
    $item.find('.receiver-username').attr('id', 'receiver-username').removeClass('receiver-username');

    $item.on('shown.bs.modal', function() {
         $(data).each(function(){
            addMessageToChat($item.find('.private-message-container'), this.senderName, this.message, this.sendTime);
        });
        chatConfiguration.privateChatReceiver = receiverUsername;
        chatConfiguration.privateChatPopup = $item;
        $('.new-messages[data-user="' + receiverUsername + '"]').addClass('hidden');
    });
    $item.on('hidden.bs.modal', function(){
        chatConfiguration.privateChatPopup.remove();
        chatConfiguration.privateChatReceiver = null;
        chatConfiguration.privateChatPopup = null;
    });
    $item.modal();
}