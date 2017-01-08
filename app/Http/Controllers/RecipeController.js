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
        var title = "Receptkönyv";
        
        yield res.sendView('main', {
            categories: categories.toJSON()
        ,title});
    }

    * latestRecipes(req, res){
        var title = "Főoldal - Receptkönyv";
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

        yield res.sendView('latestrecipes', {latest,title}); //hasznalni lehessen a latest array-t
    }

    * create(req, res){
        var title = "Új recept felvétele - Receptkönyv";
        try{
            var userID = req.currentUser.id;
            var categories = yield Category.all();

            yield res.sendView('create', {
                categories: categories.toJSON()
            ,title});
            res.redirect('/')
        }catch(e){
            title = "Receptkönyv"
            yield req
            .withAll()
            .andWith({ errors: [{
                message: "Csak bejelentkezett felhasználók hozhatnak létre új receptet!"
            }] ,title})
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

        if(post.name=="" || post.description==""){
            yield req
                .withAll()
                .andWith({ errors: [{ 
                    message: "Nem töltötte ki a név vagy leirás mezőt!"
                }],
                    title: "Új recept felvétele - Receptkönyv"
                })
                .flash()

            res.redirect('back')
            return
        }else{
            userData.user_id = req.currentUser.id
            
            var recipe = yield Recipe.create(userData);
            yield recipe.save();
            res.redirect('/recipe/'+recipe.id);
        }
    }

    * show(req, res){
        const isLoggedIn = yield req.auth.check()
        var recipe = yield Recipe.findBy('id', req.param('id'));
        var title = "Recept: " + recipe.name + " - Receptkönyv";
        yield recipe.related('category').load();

        if(isLoggedIn){
            var favorites = yield Favorite.query().where('user_id', req.currentUser.id).with('recipe').fetch()
            
            yield res.sendView('show', {
                recipe: recipe.toJSON(),
                favorites: favorites.toJSON()
            ,title});
        }else{
            yield res.sendView('show', {
                recipe: recipe.toJSON()
            ,title});
        }
    }

    * edit(req, res){
        var recipe = yield Recipe.findBy('id', req.param('id'));
        var title = recipe.name + " recept szerkesztése - Receptkönyv";
        var categories = yield Category.all();

        const isLoggedIn = yield req.auth.check()
        if (!isLoggedIn) {
            yield req
            .withAll()
            .andWith({ errors: [{
                message: "Csak bejelentkezett felhasználók szerkeszthetnek receptet!"
            }],
                title: "Receptkönyv"
            })
            .flash()

            res.redirect('/error')
        }

        if (req.currentUser.id !== recipe.user_id) {
            yield req
            .withAll()
            .andWith({ errors: [{
                message: "Ezt a receptet nem te küldted be!"
            }],
                title: "Receptkönyv"
            })
            .flash()

            res.redirect('/error')
            return
        }

        yield res.sendView('edit', {
            recipe: recipe.toJSON(),
            categories: categories.toJSON()
        ,title});
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
                .andWith({ errors: validation.messages() , title: recipe.name + " recept szerkesztése" })
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
        var title = "Receptkönyv";

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
        
        yield res.sendView('success', {message,title});
    }

    * ajaxDelete(req, res){
        var recipe = yield Recipe.findBy('id', req.param('id')); //eredeti recept adatainak lekerese

        yield recipe.delete();

        yield res.ok({
            message: "A recept sikeresen törölve lett!"
        });
    }

    * translate(req, res){
        var recipe = yield Recipe.findBy('id', req.param('id'));
        var title = recipe.name + " recept forditása";

        const isLoggedIn = yield req.auth.check()
        if (!isLoggedIn) {
            yield req
            .withAll()
            .andWith({ errors: [{
                message: "Csak bejelentkezett felhasználók fordíthatnak le receptet!"
            }],
                title: "Receptkönyv"
            })
            .flash()

            res.redirect('/error')
        }

        yield res.sendView('translate', {
            recipe: recipe.toJSON()
        ,title});

        if (validation.fails()) {
            yield req
                .withAll()
                .andWith({ errors: validation.messages() , title: recipe.name + " recept forditása" })
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
        var title = "Keresés eredménye - Receptkönyv";

        var recipes = yield Recipe.query()
            .where(function(){
                if(query!==''){
                    this.where('name', 'LIKE', '%'+query+'%');
                }
            })
            .with('category')
            .paginate(page, 5)

            //console.log(recipes.toJSON())

        yield res.sendView('search', {
            recipes: recipes.toJSON()
        ,title});
    }

    * ajaxSearch(req, res){
        var query = req.input('q');
        if(!query){
            res.ok([]);
            return;
        }
        
        var recipes = yield Recipe.query()
            .where(function(){
                    this.where('name', 'LIKE', '%'+query+'%');
            });

        res.ok(recipes);
    }

    * error(req, res){
        var title = "Receptkönyv";
        yield res.sendView('error',{title});
    }
}

module.exports = RecipeController
