// Toggle login popup
$(document).ready(function () {
    $("#loginLink").click(function (event) {
        event.preventDefault();
        $(".overlay").fadeToggle("fast");
    });

    $(".closePopupLogin").click(function () {
        $(".overlay").fadeToggle("fast");
    });
});
