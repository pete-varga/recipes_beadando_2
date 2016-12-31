$(function(){
    $("#search [name=q]").on('input',function(){
        $.get('/ajax/search',{
            q: $(this).val()
        }).done(function(result){
            console.log(result)
            var html = '';
            for(var i = 0; i < result.length; i++){
                html+='<a class="list-group-item" href="/recipe/' + result[i].id + '">' + result[i].name + '</a>';
            }
            $('.suggestions').html(html)
        })
    });
});