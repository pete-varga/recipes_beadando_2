'use strict'

const Schema = use('Schema')

class FavoritesSchema extends Schema {

  up () {
    this.create('favorites', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('recipe_id').unsigned().references('id').inTable('recipes')
      table.timestamps()
    })
  }

  down () {
    this.drop('favorites')
  }

}

module.exports = FavoritesSchema
