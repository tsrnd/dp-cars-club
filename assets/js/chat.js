io.on('connect', function(socket) {
    var token = localStorage.auth ? JSON.parse(localStorage.auth).token : null;
    io.emit('authenticate', {
        token: token
    }).on('authenticated', function() {
        $('#totalChatInput').attr('disabled', false);
    });
});

io.on('refresh-friend-list', data => {
    if (data.length > 0) {
        $('#left-friends-list').html(getFriendListForLeftSideBar(data));
    } else {
        $('#left-friends-list').html(
            "You don't have friends, <b>let's find friends.</b>"
        );
    }
});

io.on('refresh-friend-status', data => {
    // let exists = false;
    $('#left-friends-list li').each(function(e) {
        if ($(this).attr('id') == data.user._id) {
            $(this).attr(
                'class',
                data.status == 1 ? 'user-active' : 'user-inactive'
            );
            exists = true;
        }
        // if (!exists) {
        //     $('#left-friends-list').append(
        //         getFriendListForLeftSideBar([data.user])
        //     );
        // }
    });
});

function getFriendChat(data) {
    return `<div class="chat-message" style="text-align:right;">
                <p style="font-size:11px;">${data.auth.username}</p>
                <span class="chat-all-message">${data.message}</span>
                <img style="width:25px;height:25px;" src="${
                    data.auth.avatar_url
                }" />
            </div>`;
}

function getSelfChat(data) {
    return `<div class="chat-message">
                <img style="width:25px;height:25px;" src="${
                    data.auth.avatar_url
                }" />
                <span class="chat-all-message"> ${data.message}</span>
            </div>`;
}

function getFriendListForLeftSideBar(data) {
    d = '';
    data.forEach((e, index) => {
        d += `<li id="${e.user._id}" class="${
            e.status == 1 ? 'user-active' : 'user-inactive'
        }">
            <img src="${
                e.user.avatar_url
            }" /><a href="#" onclick="registerPopup('${e.user.room_id}', '${
            e.user.username
        }')">${e.user.username}<small id='new-msg-friend-${
            e.user.room_id
        }' class='badge'>${e.status == 1 ? 'active' : 'inactive'}</small></a>
        </li>`;
    });

    return d;
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
    prevActiveStatus = $(`#new-msg-friend-${id}`)
        .parent()
        .parent()
        .attr('class')
        .replace('user-', '');
    $(`#new-msg-friend-${id}`).html(prevActiveStatus);
    $(`#new-msg-friend-${id}`).css('background-color', '');
    var newPopup = true;
    for (var iii = 0; iii < popups.length; iii++) {
        //already registered. Bring it to front.
        if (id == popups[iii]) {
            Array.remove(popups, iii);
        }
    }

    popups.unshift(id);

    if (!$(`.popup-box#${id}`).length) {
        var element = `<div class="popup-box" id="${id}">
                            <div class="popup-head">
                                <div class="popup-head-left">${name}</div>
                                <div class="popup-head-right">
                                    <a href="javascript:closePopup('${id}');">&#10005;</a>
                                </div>
                                <div style="clear: both"></div>
                            </div>
                            <div class="popup-messages" id='popup-messages-${id}'>
                                // chatExamples
                            </div>
                            <input class="popup-input" type="text" id='input-${id}' />
                        </div>`;
        $('body').append(element);

        calculatePopups();

        // var chatBox = $(`#${id}`).find('.popup-messages');
        // chatBox.animate(
        //     {
        //         scrollTop: chatBox.height() + 100
        //     },
        //     0
        // );

        io.emit('loadMessage', id);

        $(`#input-${id}`).on('keypress', function(e) {
            if (e.which == 13) {
                idRoomStr = $(e.target)
                    .attr('id')
                    .split('-')[1];
                messageStr = $(e.target).val();
                sendMessage({ room_id: idRoomStr, message: messageStr });
                $(e.target).val('');
            }
        });

        return;
    }
    calculatePopups();
}
io.on('loadMessage', data => {
    let content = '';
    if (data.msg.length > 0) {
        const room_id = data.msg[0].room_id;
        data.msg.forEach(e => {
            if (data.auth_user._id == e.user._id) {
                content =
                    `<div class="chat-message" style="text-align:right;">
                        <span class="chat-all-message self-message">${
                            e.message
                        }</span>
                    </div>` + content;
            } else {
                content =
                    `<div class="chat-message">
                        <p style="font-size:11px;">${e.user.username}</p>
                        <img class='avt-chat-message' src="${
                            e.user.avatar_url
                        }" />
                        <span class="chat-all-message friends-message">${
                            e.message
                        }</span>
                    </div>` + content;
            }
        });
        $(`#popup-messages-${room_id}`).html(content);
        $(`#popup-messages-${room_id}`).animate(
            { scrollTop: $(`#popup-messages-${room_id}`).prop('scrollHeight') },
            500
        );
    }
});

io.on('serverMessage', data => {
    if ($(`.popup-box#${data.room_id}`).is(':visible')) {
        $(`#popup-messages-${data.room_id}`).append(
            `<div class="chat-message">
                <p style="font-size:11px;">${data.from_user.username}</p>
                <img class='avt-chat-message' src="${
                    data.from_user.avatar_url
                }" />
                <span class="chat-all-message friends-message">${
                    data.message.content
                }</span>
            </div>`
        );
        $(`#popup-messages-${data.room_id}`).animate(
            {
                scrollTop: $(`#popup-messages-${data.room_id}`).prop(
                    'scrollHeight'
                )
            },
            500
        );
    } else {
        $(`#new-msg-friend-${data.room_id}`).html('N');
        $(`#new-msg-friend-${data.room_id}`).css('background-color', 'red');
        $(`#side-bar-left`).prepend(`
            <div id='new-msg-${
                data.message._id
            }' class='alert alert-info' style="display: none;">
                <h5>New message from: ${data.from_user.username}</h5>
                <p>${data.message.content}</p>
            </div>
        `);
        $(`#new-msg-${data.message._id}`)
            .show('slow')
            .delay(3000)
            .hide('slow');
    }
});

sendMessage = data => {
    if (data.message.trim()) {
        io.emit('clientSendMessage', data);
        $(`#popup-messages-${data.room_id}`).append(
            `<div class="chat-message" style="text-align:right;">
                <span class="chat-all-message self-message">${
                    data.message
                }</span>
            </div>`
        );
        $(`#popup-messages-${data.room_id}`).animate(
            {
                scrollTop: $(`#popup-messages-${data.room_id}`).prop(
                    'scrollHeight'
                )
            },
            500
        );
    }
};

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
