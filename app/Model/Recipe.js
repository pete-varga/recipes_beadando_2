'use strict'

const Lucid = use('Lucid')

class Recipe extends Lucid {
    static rules (recipeId) {
        return {
            name: 'required|unique:recipes,${recipeId}',
            description: 'required',
            category_id: 'required'
        }        
    }

    category() {
        return this.belongsTo('App/Model/Category')
    }

    favorite(){
        return this.belongsTo('App/Model/Favorite')
    }
}

module.exports = Recipe
