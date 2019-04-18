$(document).ready(function() {
    $('#ip-search').click(() => {
        $('#search-dropdown')
            .hide()
            .delay(500)
            .fadeIn(500);
    });
    $('#ip-search').focusout(() => {
        $('#search-dropdown')
            .delay(200)
            .hide(0);
    });
    $('#ip-search').keyup(function(e) {
        $.get({
            url: '/api/search',
            data: 'q=' + $(this).val(),
            success: result => {
                if (result.users.length > 0) {
                    usersList = [];
                    result.users.forEach(element => {
                        usersList.push(`<a src=${
                            element.username
                        }><img class='img-avatar-search' src=${
                            element.avatar_url
                        }></img>
                        <b>${element.username}</b>
                        <small>${element.email}</small></a>`);
                    });

                    $('#search-dropdown').html(usersList);
                    $('#search-dropdown a').on('click', e => {
                        let username =
                            $(e.target.parentNode).attr('src') ||
                            $(e.target).attr('src');
                        $.get({
                            url: `/api/user/${username}/profile`,
                            success: result => {
                                $('#profile-modal-content').html(
                                    getProfileContent(result)
                                );
                                $('#profile-modal').modal('toggle');
                            }
                        });
                    });
                }
            }
        });
    });

    $('#btn-profile').click(e => {
        e.preventDefault();
        $.get({
            url: `/api/user/${
                JSON.parse(localStorage.auth).user.username
            }/profile`,
            success: result => {
                $('#profile-modal-content').html(getProfileContent(result));
                $('#profile-modal').modal('toggle');
            }
        });
    });

    function getProfileContent(data) {
        return `
        <div class="modal-header">
            <button class="close" type="button" data-dismiss="modal">×</button>
            <h4 class="modal-title" id="profile-title">${
                data.isSelf ? 'Your profile' : 'User profile'
            }</h4>
        </div>
        <div class="modal-body">
            <div class="row">
                <div class="col-sm-8">
                    <div class="media">
                        <div class="media-left">
                            <img class="media-object" src="${
                                data.user.avatar_url
                            }" style="width: 128px; height: 128px; border-radius: 50%;" />
                            <input type="file" style="display: none;" />
                        </div>
                        <div class="media-body">
                            <h2 class="media-heading" id="profile-modal-username">${
                                data.user.username
                            }</h2>
                            <p id="profile-modal-email">${data.user.email}</p>
                        </div>
                    </div>
                </div>
                <div class="col-sm-4 text-right">
                    <button class="btn btn-info" ${
                        data.isFriend ? 'disabled' : ''
                    }>${data.isSelf ? 'Edit profile' : data.isFriend ? 'Is Friend' : '+ Add Friend'}</button>
                </div>
                <div>
                    <div class='col-sm-8'>
                        <hr/>
                        <h4>Article</h4>
                        <div class="panel panel-default">
                            <div class="panel-body">
                                <p>Hello people! This is my first post. Hola!!!</p>Implement later</div>
                            <div class="panel-footer"><span>posted 2017-5-27 20:45:01 by nicholaskajoh</span><span class="pull-right"><a class="text-danger" href="#">[Delete]</a></span></div>
                        </div>
                    </div>
                    <div class='col-sm-4'>
                        <hr/>
                        <h4>Friends</h4>
                        <ul>
                            ${getFriendListInProfile(data.user.user_friends)}
                        </ul>
                    </div>
                </div>
            </div>
        </div>`;
    }

    function getFriendListInProfile(data) {
        d = '';
        data.forEach(e => {
            d += `<li><a><b>${e.username}</b></a><small>&#32;	${
                e.email
            }</small></li>`;
        });
        return d;
    }
});
