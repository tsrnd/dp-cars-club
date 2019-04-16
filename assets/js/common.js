$(document).ready(function() {
    $('#ip-search').click(() => {
        $('#search-dropdown')
            .hide()
            .delay(500)
            .fadeIn(500);
    });
    $('#ip-search').focusout(() => {
        $('#search-dropdown').hide();
    });
    $('#ip-search').keyup(function(e) {
        $.get({
            url: '/api/search',
            data: 'q=' + $(this).val(),
            success: result => {
                if (result.users.length > 0) {
                    usersList = [];
                    result.users.forEach(element => {
                        usersList.push(`<a><img class='img-avatar-search' src=${
                            element.avatar_url
                        }></img>
                        <b>${element.username}</b>
                        <small>${element.email}</small></a>`);
                    });
                    $('#search-dropdown').html(usersList);
                }
            }
        });
    });
});
