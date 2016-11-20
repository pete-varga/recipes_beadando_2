'use strict'
const User = use('App/Model/User');
const Recipe = use('App/Model/Recipe');
const Favorite = use('App/Model/Favorite');
const Category = use('App/Model/Category');
const Validator = use('Validator');
const Hash = use('Hash');

class UserController {
    * login(req, res){
        var title = "Bejelentkezés - Receptkönyv";
        yield res.sendView('login',{title});
    }

    * loginSubmit(req, res){
        try{
            var post = req.post();
            yield req.auth.attempt(post.username, post.password);
            res.redirect('/')
        }catch(e){
            yield req
                .withOut('password')
                .andWith({ errors: [{
                    message: "Az e-mail vagy jelszó helytelen!"
                }],
                    title: "Bejelentkezés - Receptkönyv"
                })
                .flash()

            res.redirect('back')
        }
    }

    * logout(req, res){
        yield req.auth.logout();
        res.redirect('/');
    }

    * register(req, res){
        var title = "Regisztráció - Receptkönyv";
        yield res.sendView('register',{title});
    }

    * registerSubmit(req, res){
        try{
            var post = req.post();

            var userData = {
                username: post.username,
                firstname: post.firstname,
                lastname: post.lastname,
                email: post.email,
                password: post.password,
                password2: post.password2
            };

            const validation = yield Validator.validateAll(userData, User.rules)

            if (validation.fails()) {
                yield req
                    .withOut('password','password2')
                    .andWith({ errors: validation.messages() , title: "Regisztráció - Receptkönyv"})
                    .flash()

                res.redirect('back')
                return
            }

            delete userData.password2;
            userData.password = yield Hash.make(userData.password);

            var user = yield User.create(userData);
            yield user.save();

            req.auth.login(user);

            res.redirect('/');
        }catch(e){
            var str = String(e);
            var emailmsg = "users.email";
            var usernamemsg = "users.username";
            var passwordmsg = "password";
            if(str.indexOf(emailmsg) != -1){
                yield req
                .withAll()
                .andWith({ errors: [{
                    message: "Ezzel az e-maillel már létezik felhasználó!"
                }],
                    title: "Regisztráció - Receptkönyv"
                })
                .flash()
            }else if(str.indexOf(usernamemsg) != -1){
                yield req
                .withAll()
                .andWith({ errors: [{
                    message: "Ezzel a felhasználónévvel már létezik felhasználó!"
                }],
                    title: "Regisztráció - Receptkönyv"
                })
                .flash()
            }

            res.redirect('back');
        }
    }

    * myrecipes(req, res){
        var title = "Saját receptjeim - Receptkönyv";
        var recipes = yield Recipe.query().where('user_id', req.currentUser.id).with('category').fetch()
        //console.log(categories);

        yield res.sendView('myrecipes', {
            recipes: recipes.toJSON()
        ,title});
    }

    * myfavorites(req, res){
        var title = "Kedvenc recepjteim - Receptkönyv";
        var favorites = yield Favorite.query().where('user_id', req.currentUser.id).with('recipe').fetch()

        yield res.sendView('myfavorites',{
            favorites: favorites.toJSON()
        ,title});
    }

    * favoriteSubmit(req, res){
        var recipe = yield Recipe.findBy('id', req.param('id'));
        var user = req.currentUser.id;
        var message = "A recept sikeresen hozzá lett adva a kedvencekhez!";
        var title = "Receptkönyv";
        var favAdded = true;

        var userData = {
            user_id: user,
            recipe_id: recipe.id
        };

        var favorite = yield Favorite.create(userData);
        yield favorite.save();

        yield res.sendView('success',{message,recipe,favAdded,title});
    }

    * favoriteDelete(req, res){
        var title = "Receptkönyv";
        var recipe = yield Recipe.findBy('id', req.param('id'));
        var favorite = yield Favorite.findBy('recipe_id', recipe.id);
        var message = "A recept sikeresen törölve lett a kedvencek közül!";
        var favDeleted = true;

        yield favorite.delete();

        yield res.sendView('success',{message,recipe,favDeleted,title});
    }

    * account(req, res){
        var title = "Fiókom - Receptkönyv";
        const isLoggedIn = yield req.auth.check()
        if (!isLoggedIn) {
            yield req
            .withAll()
            .andWith({ errors: [{
                message: "Csak bejelentkezett felhasználók tekinthetik meg a fiókjukat!"
            }], 
                title: "Receptkönyv"
            })
            .flash()

            res.redirect('/error')
        }

        yield res.sendView('account',{title});
    }

    * editAccount(req, res){
        var title = "Fiókadatok szerkesztése - Receptkönyv";
        const isLoggedIn = yield req.auth.check()
        if (!isLoggedIn) {
            yield req
            .withAll()
            .andWith({ errors: [{
                message: "Csak bejelentkezett felhasználók szerkeszthetik fiókjuk adatait!"
            }],
                title: "Receptkönyv"
            })
            .flash()

            res.redirect('/error')
        }

        yield res.sendView('editaccount',{title});
    }

    * accountSubmit(req, res){
        try{
            var user = yield User.findBy('id', req.currentUser.id);
            const userId = user.id;
            var post = req.post();
            var message = "Fiókod adatai sikeresen frissítve lettek!"

            var userData = {
                username: post.username,
                firstname: post.firstname,
                lastname: post.lastname,
                email: post.email,
                password: post.password,
                password2: post.password2
            };

            const validation = yield Validator.validateAll(userData, User.rules(userId))

            if (validation.fails()) {
                yield req
                    .withOut('password','password2')
                    .andWith({ errors: validation.messages() , title: "Fiókadatok szerkesztése - Receptkönyv"})
                    .flash()

                res.redirect('back')
                return
            }

            user.username = post.username;
            user.firstname = post.firstname;
            user.lastname = post.lastname;
            user.email = post.email;
            user.password = post.password;

            user.password = yield Hash.make(user.password);

            yield user.save();

            yield res.sendView('success',{message});
        }catch(e){
            var str = String(e);
            var emailmsg = "users.email";
            var usernamemsg = "users.username";
            var passwordmsg = "password";
            if(str.indexOf(emailmsg) != -1){
                yield req
                .withAll()
                .andWith({ errors: [{
                    message: "Ezzel az e-maillel már létezik felhasználó!"
                }],
                    title: "Fiókadatok szerkesztése - Receptkönyv"
                })
                .flash()
            }else if(str.indexOf(usernamemsg) != -1){
                yield req
                .withAll()
                .andWith({ errors: [{
                    message: "Ezzel a felhasználónévvel már létezik felhasználó!"
                }],
                    title: "Fiókadatok szerkesztése - Receptkönyv"
                })
                .flash()
            }
        
            res.redirect('back');
        }
    }
}

module.exports = UserController
