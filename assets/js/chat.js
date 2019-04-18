io.on('connect', function(socket) {
    var token = localStorage.auth ? JSON.parse(localStorage.auth).token : null;
    io.emit('authenticate', {
        token: token
    }).on('authenticated', function() {
        $('#totalChatInput').attr('disabled', false);
    });
});

function getFriendChat(data) {
    return `<div class="chat-message" style="text-align:right;">
                <p style="font-size:11px;">${data.auth.username}</p>
                <span class="chat-all-message">${data.message}</span>
                <img style="width:25px;height:25px;" src="${data.auth.avatar_url}" />
            </div>`;
}

function getSelfChat(data) {
    return `<div class="chat-message">
                <img style="width:25px;height:25px;" src="${data.auth.avatar_url}" />
                <span class="chat-all-message"> ${data.message}</span>
            </div>`;
}

// CHAT ALL
$('#totalChatInput').keyup(function(event) {
    var input = $(this);
    var keycode = event.keyCode ? event.keyCode : event.which;
    var inputMessage = input.val().trim();
    if (keycode == '13' && inputMessage) {
        io.emit('chatAll', {
            message: inputMessage
        });
        input.val('');
    }
});

io.on('chatAll', (data, self) => {
    var chatBox = $('#totalChatBox');
    var message = '';
    if (self) {
        message = getSelfChat(data);
    } else {
        message = getFriendChat(data);
    }
    chatBox.append(message);
    chatBox.animate(
        {
            scrollTop: chatBox.height() * 1000
        },
        0
    );
});

// CHAT PRIVATE
//this function can remove a array element.
Array.remove = function(array, from, to) {
    var rest = array.slice((to || from) + 1 || array.length);
    array.length = from < 0 ? array.length + from : from;
    return array.push.apply(array, rest);
};

//this variable represents the total number of popups can be displayed according to the viewport width
var totalPopups = 0;

//arrays of popups ids
var popups = [];

//this is used to close a popup
function closePopup(id) {
    for (var iii = 0; iii < popups.length; iii++) {
        if (id == popups[iii]) {
            Array.remove(popups, iii);

            $(`#${id}`).css('display', 'none');

            calculatePopups();
            return;
        }
    }
}

//displays the popups. Displays based on the maximum number of popups that can be displayed on the current viewport width
function displayPopups() {
    var left = $(window).width() * 0.22;

    var iii = 0;
    for (iii; iii < totalPopups; iii++) {
        if (popups[iii] != undefined) {
            var element = $(`#${popups[iii]}`);
            element.css('left', left + 'px');
            element.css('display', 'block');
            left = left + 280;
        }
    }

    for (var jjj = iii; jjj < popups.length; jjj++) {
        $(`#${popups[jjj]}`).css('display', none);
    }
}

//creates markup for a new popup. Adds the id to popups array.
function registerPopup(id, name) {
    var newPopup = true;
    for (var iii = 0; iii < popups.length; iii++) {
        //already registered. Bring it to front.
        if (id == popups[iii]) {
            Array.remove(popups, iii);
        }
    }

    popups.unshift(id);

    if (!$(`.popup-box#${id}`).length) {
        // Example chat messages
        var chatExamples = `<div class="chat-message"><img style="width:25px;height:25px;" src="https://api.adorable.io/avatars/1" /><span class="chat-all-message"> Hello</span></div>
                            <div class="chat-message" style="text-align:right;">
                                <p style="font-size:11px;">Username</p><span class="chat-all-message">Hello </span><img style="width:25px;height:25px;" src="https://api.adorable.io/avatars/2" /></div>
                            <div class="chat-message"><img style="width:25px;height:25px;" src="https://api.adorable.io/avatars/1" /><span class="chat-all-message"> :)</span></div>
                            <div class="chat-message"><img style="width:25px;height:25px;" src="https://api.adorable.io/avatars/1" /><span class="chat-all-message"> Hello</span></div>
                            <div class="chat-message" style="text-align:right;">
                                <p style="font-size:11px;">Username</p><span class="chat-all-message">Hello </span><img style="width:25px;height:25px;" src="https://api.adorable.io/avatars/2" /></div>
                            <div class="chat-message"><img style="width:25px;height:25px;" src="https://api.adorable.io/avatars/1" /><span class="chat-all-message"> :)</span></div>
                            <div class="chat-message"><img style="width:25px;height:25px;" src="https://api.adorable.io/avatars/1" /><span class="chat-all-message"> Hello</span></div>
                            <div class="chat-message" style="text-align:right;">
                                <p style="font-size:11px;">Username</p><span class="chat-all-message">Hello </span><img style="width:25px;height:25px;" src="https://api.adorable.io/avatars/2" /></div>
                            <div class="chat-message"><img style="width:25px;height:25px;" src="https://api.adorable.io/avatars/1" /><span class="chat-all-message"> :)</span></div>
                            <div class="chat-message"><img style="width:25px;height:25px;" src="https://api.adorable.io/avatars/1" /><span class="chat-all-message"> Hello</span></div>
                            <div class="chat-message" style="text-align:right;">
                                <p style="font-size:11px;">Username</p><span class="chat-all-message">Hello </span><img style="width:25px;height:25px;" src="https://api.adorable.io/avatars/2" /></div>
                            <div class="chat-message"><img style="width:25px;height:25px;" src="https://api.adorable.io/avatars/1" /><span class="chat-all-message"> :)</span></div>
                            <div class="chat-message"><img style="width:25px;height:25px;" src="https://api.adorable.io/avatars/1" /><span class="chat-all-message"> Hello</span></div>
                            <div class="chat-message" style="text-align:right;">
                                <p style="font-size:11px;">Username</p><span class="chat-all-message">Hello </span><img style="width:25px;height:25px;" src="https://api.adorable.io/avatars/2" /></div>
                            <div class="chat-message"><img style="width:25px;height:25px;" src="https://api.adorable.io/avatars/1" /><span class="chat-all-message"> :)</span></div>`;

        var element = `<div class="popup-box" id="${id}">
                            <div class="popup-head">
                                <div class="popup-head-left">${name}</div>
                                <div class="popup-head-right">
                                    <a href="javascript:closePopup('${id}');">&#10005;</a>
                                </div>
                                <div style="clear: both"></div>
                            </div>
                            <div class="popup-messages">
                                ${chatExamples}
                            </div>
                            <input class="popup-input" type="text" />
                        </div>`;
        $('body').append(element);

        calculatePopups();

        var chatBox = $(`#${id}`).find('.popup-messages');
        chatBox.animate(
            {
                scrollTop: chatBox.height() + 100
            },
            0
        );
        return;
    }
    calculatePopups();
}

//calculate the total number of popups suitable and then populate the toatal_popups variable.
function calculatePopups() {
    var width = $(window).width() * 0.8;
    if (width < 540) {
        totalPopups = 0;
    } else {
        //320 is width of a single popup box
        totalPopups = parseInt(width / 280);
    }
    displayPopups();
}

//recalculate when window is loaded and also when window is resized.
$(window).on('resize', calculatePopups);
$(window).on('load', calculatePopups);
