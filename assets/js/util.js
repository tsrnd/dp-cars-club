function updateProfile(username) {
    console.log('Update profile comming some.');
}

function addFriend(username, avatar_url, cursor) {
    $.post({
        url: `/api/user/add_friend/${username}`,
        error: err => {
            if (err.status == 401) {
                alert('Please, login.')
            }
            console.log(err);
        },
        success: res => {
            $('#alert-profile-action').html(res.msg);
            if (res.msg == 'Suggested, please wait for approval.') {
                $(cursor).attr('disabled', true);
                return;
            }
            $(cursor)
                .attr('disabled', true)
                .html('Is Friend');
            $('#left-friends-list').append(`<li>
            <img src="${avatar_url}" /><a href="#" onclick="registerPopup('${$(
                '#left-friends-list li'
            ).length + 1}', '${username}')">${username}</a>
            </li>`);
            io.disconnect();
            io.connect();
            $('#profile-modal').modal('toggle');
        }
    });
}
