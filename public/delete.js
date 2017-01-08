$(function(){
    var $form = $('#torol');
    $('.modal .modal-ok').on('click',function(){
        $.ajax({
                url: '/ajax'+$form.attr('action'),
                data: $form.serializeArray(),
                type: 'DELETE',
                dataType: 'html',
            }).done(function(res){
                $('.modal-backdrop').fadeOut(300);
                var data = JSON.parse(res);
                $('.container').html(`<p class="lead">A recept sikeresen törölve lett! Hamarosan átirányitunk a főoldalra.</p>`);
                setTimeout(function(e){
                    location.assign('/'); //ide atiranyit utana
                }, 700);
            }).fail(function(res){
                $('.container').html(`<p class="lead">A recept törlésének folyamatakor hiba lépett fel. Kérjük próbáld meg újra!</p>`);
            });
    });
    $form.on('submit',function(event){
        event.preventDefault();
        $('.modal').modal('show');
    });
});