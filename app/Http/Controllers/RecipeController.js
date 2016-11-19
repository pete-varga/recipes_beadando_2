'use strict'
const Category = use('App/Model/Category');
const Favorite = use('App/Model/Favorite');
const Recipe = use('App/Model/Recipe');
const User = use('App/Model/User');
const Validator = use('Validator');
const Database = use('Database');

class RecipeController {
    * list(req, res){ //*: async fuggveny, yield async fuggvenyek ele kell
        var categories = yield Category.with('recipes').fetch(); //recipes = ugyanaz, mint categoryba recipes()
        
        yield res.sendView('main', {
            categories: categories.toJSON()
        });
    }

    * latestRecipes(req, res){
        var recipeNames = yield Database.table('recipes').orderBy('created_at', 'desc').pluck('name') //csokkeno sorrendben a letrehozast illetoen, es csak a recept nevet adja vissza
        var recipeIds = yield Database.table('recipes').orderBy('created_at', 'desc').pluck('id')
        var recipeCategoryIds = yield Database.table('recipes').orderBy('created_at', 'desc').pluck('category_id')
        var categoryIds = yield Database.table('categories').pluck('id');
        var categoryNames = yield Database.table('categories').pluck('name');
        var latest = [];
        var categories = [];
        for (var i = 0; i < recipeNames.length; i++) {
            latest[i] = [recipeIds[i]];
            latest[i][1] = [recipeNames[i]];
            latest[i][1][1] = recipeCategoryIds[i];
        }
        for (var j = 0; j < categoryNames.length; j++){
            categories[j] = [categoryIds[j]];
            categories[j][1] = categoryNames[j];
        }
        for (var k = 0; k < recipeNames.length; k++){
            for (var l = 0; l < categoryNames.length; l++){
                if (latest[k][1][1] == categories[l][0]){
                    latest[k][1][1] = recipeCategoryIds[k];
                    latest[k][1][2] = categories[l][1];
                }
            }
        }

        if(latest.length!=0){
            latest.length = 10; //10 legfrissebb recept
        }
        

        yield res.sendView('latestrecipes', {latest}); //hasznalni lehessen a latest array-t
    }

    * create(req, res){
        try{
            var userID = req.currentUser.id;
            var categories = yield Category.all();

            yield res.sendView('create', {
                categories: categories.toJSON()
            });
            res.redirect('/')
        }catch(e){
            yield req
            .withAll()
            .andWith({ errors: [{
                message: "Csak bejelentkezett felhasználók hozhatnak létre új receptet!"
            }] })
            .flash()

            res.redirect('/error')
        }
    }

    * createNew(req, res){
        var post = req.post();

        var userData = {
            name: post.name,
            description: post.description,
            englishName: post.englishName,
            englishDescription: post.englishDescription,
            category_id: post.category_id
        };

        const validation = yield Validator.validateAll(userData, Recipe.rules)

        if (validation.fails()) {
            yield req
                .withAll()
                .andWith({ errors: validation.messages() })
                .flash()

            res.redirect('back')
            return
        }

        userData.user_id = req.currentUser.id
        
        var recipe = yield Recipe.create(userData);
        yield recipe.save();
        res.redirect('/recipe/'+recipe.id);
    }

    * show(req, res){
        const isLoggedIn = yield req.auth.check()
        var recipe = yield Recipe.findBy('id', req.param('id'));
        yield recipe.related('category').load();

        if(isLoggedIn){
            var favorites = yield Favorite.query().where('user_id', req.currentUser.id).with('recipe').fetch()
            
            yield res.sendView('show', {
                recipe: recipe.toJSON(),
                favorites: favorites.toJSON()
            });
        }else{
            yield res.sendView('show', {
                recipe: recipe.toJSON()
            });
        }
    }

    * edit(req, res){
        var recipe = yield Recipe.findBy('id', req.param('id'));
        var categories = yield Category.all();

        const isLoggedIn = yield req.auth.check()
        if (!isLoggedIn) {
            yield req
            .withAll()
            .andWith({ errors: [{
                message: "Csak bejelentkezett felhasználók szerkeszthetnek receptet!"
            }] })
            .flash()

            res.redirect('/error')
        }

        if (req.currentUser.id !== recipe.user_id) {
            yield req
            .withAll()
            .andWith({ errors: [{
                message: "Ezt a receptet nem te küldted be!"
            }] })
            .flash()

            res.redirect('/error')
            return
        }

        yield res.sendView('edit', {
            recipe: recipe.toJSON(),
            categories: categories.toJSON()
        });
    }

    * editSubmit(req, res){
        var recipe = yield Recipe.findBy('id', req.param('id')); //eredeti recept adatainak lekerese
        const recipeId = recipe.id;
        var post = req.post();

        var userData = {
                name: post.name,
                description: post.description,
                englishName: post.englishName,
                englishDescription: post.englishDescription,
                category_id: post.category_id
            };
        
        const validation = yield Validator.validateAll(userData, Recipe.rules(recipeId))

        if (validation.fails()) {
            yield req
                .withAll()
                .andWith({ errors: validation.messages() })
                .flash()

            res.redirect('back')
            return
        }

        recipe.name = post.name;
        recipe.description = post.description;
        recipe.englishName = post.englishName;
        recipe.englishDescription = post.englishDescription;
        recipe.category_id = post.category_id;

        yield recipe.save();

        res.redirect('/recipe/'+recipe.id);
    }

    * delete(req, res){
        var recipe = yield Recipe.findBy('id', req.param('id'));
        var message = "A recept sikeresen törölve lett!";

        try{
            var fav = yield Database.table('favorites');
            
            for (var i = 0; i < fav.length; i++){
                var favorite = yield Favorite.findBy('recipe_id', recipe.id);
                yield favorite.delete();
            }
            
            yield recipe.delete();
        }catch(e){
            yield recipe.delete();
        }

        /*var recipe = yield Recipe.findBy('id', req.param('id'));
        var favorite = yield Favorite.findBy('recipe_id', recipe.id);

        yield favorite.delete();
        yield recipe.delete();*/

        //res.redirect('/');
        yield res.sendView('success', {message});
    }

    * translate(req, res){
        var recipe = yield Recipe.findBy('id', req.param('id'));
        

        const isLoggedIn = yield req.auth.check()
        if (!isLoggedIn) {
            yield req
            .withAll()
            .andWith({ errors: [{
                message: "Csak bejelentkezett felhasználók fordíthatnak le receptet!"
            }] })
            .flash()

            res.redirect('/error')
        }

        yield res.sendView('translate', {
            recipe: recipe.toJSON()
        });


        if (validation.fails()) {
            yield req
                .withAll()
                .andWith({ errors: validation.messages() })
                .flash()

            res.redirect('back')
            return
        }
    }

    * translateSubmit(req, res){
        var post = req.post(); //form adatainak lekerese
        var recipe = yield Recipe.findBy('id', req.param('id'));

        recipe.englishName=post.englishName;
        recipe.englishDescription=post.englishDescription;

        yield recipe.save();

        res.redirect('/recipe/'+recipe.id);
    }

    * search(req, res){
        var query = req.input('q') || '';
        var page = req.input('page') || 1;


        var recipes = yield Recipe.query()
            .where(function(){
                if(query!==''){
                    this.where('name', 'LIKE', '%'+query+'%');
                }
            })
            .with('category')
            .paginate(page, 2)

            //console.log(recipes.toJSON())

        yield res.sendView('search', {
            recipes: recipes.toJSON()
        });
    }

    * error(req, res){
        yield res.sendView('error');
    }
}

module.exports = RecipeController
