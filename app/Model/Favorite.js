'use strict'

const Lucid = use('Lucid')

class Favorite extends Lucid {
    user() {
        return this.belongsTo('App/Model/User')
    }

    recipe(){
        return this.belongsTo('App/Model/Recipe')
    }
}

module.exports = Favorite
