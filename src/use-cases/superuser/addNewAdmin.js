'use strict';
const db = require('../../db');
const admins = db('admins');
const bcrypt = require('bcrypt')
const TokenService = require('../../services/auth/JWTService')
const removeBearer = require('../../lib/removeBearer')
const throwValidationError = require('../../lib/ValidationError')

async function addNewAdmin(args, token) {
    const username = args.username
    const password = args.password

    const clearToken = removeBearer(token)
    
    const verifiedAccessToken = TokenService.verifyAccessToken(clearToken)
    console.log(verifiedAccessToken);
     
    if (verifiedAccessToken && verifiedAccessToken.role == 2)
    {
        const hashedPassword = await bcrypt.hash(password, 10);
        await admins.create({username,password: hashedPassword,role: 1});
        console.log(`Админ с именем пользователя ${username} был успешно добавлен`);
    } else {
        throwValidationError("Не удалось добавить админа" )
    }
       
}

module.exports = addNewAdmin