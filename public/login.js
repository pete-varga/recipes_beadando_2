$(function(){
    var $loginLink = $('#login-link');

    var $loginDialog = $(`
        <div class="modal fade confirm-modal" tabindex="-1" role="dialog" id="loginModal">
            <div class="modal-dialog modal-md" role="document">
                <div class="modal-content">
                <div class="modal-header">Bejelentkezés</div>
                <div class="modal-body">
                    <div class="alert alert-danger">A megadott adatok hibasak!</div>
                    <div class="alert alert-success">Sikeres bejelentkezés</div>
                    <div class="form-area">
                    </div>
                </div>
                </div>
            </div>
        </div>
    `);

    var $loginAlertError = $loginDialog.find('.alert-danger');
    var $loginAlertSuccess = $loginDialog.find('.alert-success');
    $loginAlertError.hide();
    $loginAlertSuccess.hide();

    $loginDialog.find('.form-area').load('/login .login-form',function(){ //aszinkron, varjunk, hogy betoltse es utana a function
        $loginForm = $loginDialog.find('.login-form');
        $loginForm.on('submit',function(e){
            e.preventDefault();

            $.ajax({
                url: '/ajax/login',
                data: $loginForm.serializeArray(),
                type: 'POST',
                dataType: 'json',
            }).done(function(res){
                if(res.success){
                    $loginForm.hide();
                    $loginAlertSuccess.fadeIn(300);
                    setTimeout(function(){
                        $loginDialog.modal('hide');
                    }, 850);
                    $('.navbar-collapse').load('/ .navbar-collapse');
                }else{
                    $loginAlertError.show();
                }
            }).fail(function(res){
                $loginAlertError.show();
            });
        });
    });

    $loginLink.on('click',function(e){
        e.preventDefault();

        $loginDialog.modal('show');
    });
});