var io = io('/');

$(document).ready(function() {
    if (localStorage.auth != undefined) {
        auth = JSON.parse(localStorage.auth);
        afterAuth(auth);
    } else {
        $('#left-requests-list').html('This function requires <b>Sign In</b>.');
        $('#left-friends-list').html('This function requires <b>Sign In</b>.');
        $('#left-groups-list').html('This function requires <b>Sign In</b>.');
    }
    $('#btn-signin').click(() => {
        $.post({
            url: '/api/signin',
            data: $('#signin-form')
                .serialize()
                .replace(/signin-/g, ''),
            success: result => {
                localStorage.auth = JSON.stringify(result);
                $('#popupLogin').hide();
                afterAuth(result);
                io.disconnect();
                io.connect();
            },
            error: result => {
                if (result.status == 400) {
                    let errors = result.responseJSON.errors;
                    errors.forEach(element => {
                        $('#err-signin-' + element.param)
                            .html(element.msg)
                            .show();
                    });
                } else if (result.status == 401) {
                    alert('Username or password incorrect. Please, try again.');
                } else {
                    alert('Oops! There was an error. Please, try again.');
                }
            }
        });
    });
    $('#btn-signup').click(() => {
        $.post({
            url: '/api/signup',
            data: $('#signup-form')
                .serialize()
                .replace(/signup-/g, ''),
            success: result => {
                localStorage.auth = JSON.stringify(result);
                $('#popupLogin').hide();
                afterAuth(result);
                io.disconnect();
                io.connect();
            },
            error: result => {
                if (result.status == 400) {
                    let errors = result.responseJSON.errors;
                    errors.forEach(element => {
                        $('#err-signup-' + element.param)
                            .html(element.msg)
                            .show();
                    });
                } else {
                    alert('Oops! There was an error. Please, try again.');
                }
            }
        });
    });

    $('#btn-logout').click(() => {
        location.reload(true);
        localStorage.clear();
    });

    function afterAuth(auth) {
        requestSetting(auth.token);
        $.get({
            url: `/api/user/${auth.user.username}/profile`,
            success: result => {
                $('#loginLink').hide();
                $('#txt-welcome')
                    .html('Hi, ' + result.user.username)
                    .show();
                $('#btn-profile').show();
                alertSuccess({
                    content:
                        'You have successfully logged in with <b>' +
                        result.user.username +
                        '</b>'
                });
                $('#img-auth-avatar')
                    .attr('src', result.user.avatar_url)
                    .show();
                if (result.user.user_friends.length > 0) {
                    $('#left-friends-list').html(
                        getFriendListForLeftSideBar(result.user.user_friends)
                    );
                } else {
                    $('#left-friends-list').html(
                        "You don't have friends, <b>let's find friends.</b>"
                    );
                }
                $('#left-requests-list').html('Comming soon')
                $('#left-groups-list').html('Comming soon')
            },
            error: err => {
                if (err.status == 401) {
                    alert('Your session has expired. Please try login again');
                }
            }
        });
    }

    function getFriendListForLeftSideBar(data) {
        d = '';
        data.forEach((e, index) => {
            d += `<li>
                <img src="${
                    e.avatar_url
                }" /><a href="#" onclick="registerPopup('${index + 1}', '${
                e.username
            }')">${e.username}</a>
            </li>`;
        });

        return d;
    }

    function requestSetting(token) {
        $.ajaxSetup({
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            }
        });
    }
    function alertSuccess(d) {
        $('#alert-success')
            .html(d.content)
            .fadeTo(2000, 500)
            .slideUp(500, function() {
                $('#alert-success').slideUp(500);
            });
    }
});
