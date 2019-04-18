$(document).ready(function() {
    if (localStorage.auth != undefined) {
        auth = JSON.parse(localStorage.auth);
        afterAuth(auth);
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
        logout();
    });

    function afterAuth(auth) {
        $('#loginLink').hide();
        $('#txt-welcome')
            .html('Hi, ' + auth.user.username)
            .show();
        $('#btn-profile').show();
        requestSetting(auth.token);
        alertSuccess({
            content:
                'You have successfully logged in with <b>' +
                auth.user.username +
                '</b>'
        });
        $('#img-auth-avatar')
            .attr('src', auth.user.avatar_url)
            .show();
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
    function logout() {
        localStorage.clear();
        $('#loginLink').show();
        $('#img-auth-avatar').hide();
        $('#btn-profile').hide();
        $('#txt-welcome').hide();
        alertSuccess({
            content: 'You are not logged in, please login to use more features.'
        });
    }
});
