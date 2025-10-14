'use strict';
const bcrypt = require('bcrypt');
const TokenService = require('../../services/auth/JWTService');
const db = require('../../db');
const TokenStorage = require('../../storages/TokenStorage');
const admins = db('admins');
const throwValidationError = require('../../lib/ValidationError')

async function login(args,res) {
    const username = args.username
    const password = args.password
    const sql = `SELECT id, password, role FROM ADMINS WHERE username = $1`;
    const admin = await admins.query(sql, [username]);

    if (admin.rows.length < 1) {
      throwValidationError(`Админ с логином ${username} не найден`);
    }

    const isValid = await bcrypt.compare(password, admin.rows[0].password);
    if (!isValid) {
      throwValidationError('Неверный пароль');
    }

    const exist_token = await TokenStorage.getByUsernameToken(username)
    if (exist_token) {
      await TokenStorage.deleteToken(username);
    }

    const admin_id = admin.rows[0].id;
    const role = admin.rows[0].role;
    const payload = { admin_id, username, role };
    const tokens = TokenService.generateTokens(payload);
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await TokenStorage.setToken(username, role, hashedRefreshToken);

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = [
      `refreshToken=${tokens.refreshToken}`,
      'HttpOnly',
      isProduction ? 'Secure' : '',
      'SameSite=Strict',
      `Max-Age=${7 * 24 * 60 * 60}` // 7 дней в секундах
    ].filter(Boolean).join('; ');

    res.setHeader('Set-Cookie', cookieOptions);

    return {accessToken: tokens.accessToken}

}

module.exports = login;