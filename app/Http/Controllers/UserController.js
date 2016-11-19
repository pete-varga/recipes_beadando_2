'use strict'
const User = use('App/Model/User');
const Recipe = use('App/Model/Recipe');
const Favorite = use('App/Model/Favorite');
const Category = use('App/Model/Category');
const Validator = use('Validator');
const Hash = use('Hash');

class UserController {
    * login(req, res){
        yield res.sendView('login');
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
                }] })
                .flash()

            res.redirect('back')
        }
    }

    * logout(req, res){
        yield req.auth.logout();
        res.redirect('/');
    }

    * register(req, res){
        yield res.sendView('register');
    }

    * registerSubmit(req, res){
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
                .andWith({ errors: validation.messages() })
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
    }

    * myrecipes(req, res){
        var recipes = yield Recipe.query().where('user_id', req.currentUser.id).with('category').fetch()
        //console.log(categories);

        yield res.sendView('myrecipes', {
            recipes: recipes.toJSON()
        });
    }

    * myfavorites(req, res){
        var favorites = yield Favorite.query().where('user_id', req.currentUser.id).with('recipe').fetch()

        yield res.sendView('myfavorites',{
            favorites: favorites.toJSON()
        });
    }

    * favoriteSubmit(req, res){
        var recipe = yield Recipe.findBy('id', req.param('id'));
        var user = req.currentUser.id;
        var message = "A recept sikeresen hozzá lett adva a kedvencekhez!";
        var favAdded = true;

        var userData = {
            user_id: user,
            recipe_id: recipe.id
        };

        var favorite = yield Favorite.create(userData);
        yield favorite.save();

        yield res.sendView('success',{message,recipe,favAdded});
    }

    * favoriteDelete(req, res){
        var recipe = yield Recipe.findBy('id', req.param('id'));
        var favorite = yield Favorite.findBy('recipe_id', recipe.id);
        var message = "A recept sikeresen törölve lett a kedvencek közül!";
        var favDeleted = true;

        yield favorite.delete();

        yield res.sendView('success',{message,recipe,favDeleted});
    }

    * account(req, res){
        const isLoggedIn = yield req.auth.check()
        if (!isLoggedIn) {
            yield req
            .withAll()
            .andWith({ errors: [{
                message: "Csak bejelentkezett felhasználók tekinthetik meg a fiókjukat!"
            }] })
            .flash()

            res.redirect('/error')
        }

        yield res.sendView('account');
    }

    * editAccount(req, res){
        const isLoggedIn = yield req.auth.check()
        if (!isLoggedIn) {
            yield req
            .withAll()
            .andWith({ errors: [{
                message: "Csak bejelentkezett felhasználók szerkeszthetik fiókjuk adatait!"
            }] })
            .flash()

            res.redirect('/error')
        }

        yield res.sendView('editaccount');
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
                    .andWith({ errors: validation.messages() })
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
                }] })
                .flash()
            }else if(str.indexOf(usernamemsg) != -1){
                yield req
                .withAll()
                .andWith({ errors: [{
                    message: "Ezzel a felhasználónévvel már létezik felhasználó!"
                }] })
                .flash()
            }
            

            res.redirect('back');
        }
    }
}

module.exports = UserController
