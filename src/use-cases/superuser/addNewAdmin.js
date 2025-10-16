'use strict';
const db = require('../../db');
const admins = db('admins');
const bcrypt = require('bcrypt')
const TokenService = require('../../services/auth/JWTService')
const removeBearer = require('../../lib/removeBearer')
const throwValidationError = require('../../lib/ValidationError')

async function addNewAdmin(args) {
    const {username, name , password} = args

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await admins.create({username,name,password: hashedPassword,role: 1});
       console.log(`Админ с именем пользователя ${username} был успешно добавлен`) 
    } catch (error) {
        throwValidationError("Не удалось добавить админа" )
    }
 
       
}

module.exports = addNewAdmin