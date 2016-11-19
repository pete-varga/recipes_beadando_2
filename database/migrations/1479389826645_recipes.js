'use strict'

const Schema = use('Schema')

class RecipesSchema extends Schema {

  up () {
    this.create('recipes', (table) => {
      table.increments()
      table.string('name').notNullable()
      table.string('description').notNullable()
      table.string('englishName')
      table.string('englishDescription')
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('category_id').unsigned().references('id').inTable('categories')
      table.timestamps()
    })
  }

  down () {
    this.drop('recipes')
  }

}

module.exports = RecipesSchema
