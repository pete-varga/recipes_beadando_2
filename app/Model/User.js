'use strict'

const Lucid = use('Lucid')

class User extends Lucid {
  static rules (userId) {
        return {
            username: 'required|unique:users,${userId}',
            email: 'required|email|unique:users,${userId}',
            firstname: 'required',
            lastname: 'required',
            password: 'required|min:5',
            password2: 'required|min:5|same:password',
        }        
    }

  apiTokens () {
    return this.hasMany('App/Model/Token')
  }

}

module.exports = User
