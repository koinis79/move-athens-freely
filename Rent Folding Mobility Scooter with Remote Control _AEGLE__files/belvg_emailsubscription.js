$(document).ready(function () {
    $('#belvg_email_subscription').on('submit', function (e) {
        e.preventDefault();
        let emailsubscriptionForm = $(this);
        let email = $("#belvg_email_subscription_email").val();
        $('.block_newsletter_alert').remove();
        $.ajax({
            type: 'POST',
            dataType: 'JSON',
            url: $("#belvg_email_subscription > form").attr('action'),
            cache: false,
            data: {'email': email},
            success: function (data) {
                if (data.nw_error) {
                    emailsubscriptionForm.prepend('<p class="alert alert-danger block_newsletter_alert">' + data.msg + '</p>');
                } else {
                    emailsubscriptionForm.prepend('<p class="alert alert-success block_newsletter_alert">' + data.msg + '</p>');
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
        return false;
    });
});
