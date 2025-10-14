'use strict';
const bcrypt = require('bcrypt');
const TokenService = require('../../services/auth/JWTService');
const db = require('../../db');
const TokenStorage = require('../../storages/TokenStorage');
const admins = db('admins');
const throwValidationError = require('../../lib/ValidationError')

async function login(args) {
    const username = args.username
    const password = args.password
    const sql = `SELECT * FROM ADMINS WHERE username = $1`;
    const admin = await admins.query(sql, [username]);

    if (admin.rows.length < 1) {
      throwValidationError(`Админ с логином ${username} не найден`);
    }

    const isValid = await bcrypt.compare(password, admin.rows[0].password);
    if (!isValid) {
      throwValidationError('Неверный пароль');
    }

    const exist_token = await TokenStorage.getToken(username);
    if (exist_token) {
      await TokenStorage.deleteToken(username);
    }

    const admin_id = admin.rows[0].id;
    const role = admin.rows[0].role;
    const payload = { admin_id, username, role };
    const tokens = TokenService.generateTokens(payload);
    await TokenStorage.setToken(username, role, tokens.refreshToken);

    return {accessToken: tokens.accessToken}

}

module.exports = login;