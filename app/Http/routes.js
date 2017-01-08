'use strict'

/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
|
| AdonisJs Router helps you in defining urls and their actions. It supports
| all major HTTP conventions to keep your routes file descriptive and
| clean.
|
| @example
| Route.get('/user', 'UserController.index')
| Route.post('/user', 'UserController.store')
| Route.resource('user', 'UserController')
*/

const Route = use('Route')

//Route.on('/').render('welcome')
//Route.on('/').render('main.njk')
Route.get('/','RecipeController.latestRecipes');
Route.get('/all','RecipeController.list');
Route.get('/create','RecipeController.create');
Route.post('/create','RecipeController.createNew');
Route.get('/recipe/:id','RecipeController.show');
Route.get('/recipe/:id/edit','RecipeController.edit');
Route.post('/recipe/:id/edit','RecipeController.editSubmit');
Route.post('/recipe/:id/delete','RecipeController.delete');
Route.get('/recipe/:id/translate','RecipeController.translate');
Route.post('/recipe/:id/translate','RecipeController.translateSubmit');
Route.get('/register','UserController.register');
Route.post('/register','UserController.registerSubmit');
Route.get('/login','UserController.login');
Route.post('/login','UserController.loginSubmit');
Route.get('/logout','UserController.logout');
Route.post('/search','RecipeController.search');
Route.get('/search','RecipeController.search');
Route.get('/account','UserController.account');
Route.get('/editaccount','UserController.editAccount');
Route.post('/editaccount','UserController.accountSubmit');
Route.get('/myrecipes','UserController.myrecipes');
Route.get('/myfavorites','UserController.myfavorites');
Route.post('/recipe/:id/favorite','UserController.favoriteSubmit');
Route.post('/recipe/:id/removeFavorite','UserController.favoriteDelete');
Route.get('/error','RecipeController.error');
Route.group('ajax', function () {
    Route.get('/search', 'RecipeController.ajaxSearch')
    Route.post('/login', 'UserController.ajaxLogin')
    Route.delete('/recipe/:id/delete', 'RecipeController.ajaxDelete')
}).prefix('/ajax')
