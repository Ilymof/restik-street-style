'use strict'
const TokenService = require('../../services/auth/JWTService')
const TokenStorage = require('../../storages/TokenStorage')
const throwValidationError = require('../../lib/ValidationError')
const bcrypt = require('bcrypt');

const toRefreshToken = async (req, res) => {
   //Беру токен из cookie
      const cookies = req.headers.cookie?.split('; ').find(row => row.startsWith('refreshToken='))?.split('=')[1];
      const refreshToken = cookies || null;
      if (!refreshToken) {
         throwValidationError('Refresh token missing');
      }
   //декодинг токена, если он не истёк
      const verifiedToken = TokenService.verifyRefreshToken(refreshToken)

      if(!verifiedToken){
         throwValidationError('Не правильный токен')
      }
   //Вытягиваю из базы данных сюществующий токен
      const storedToken = await TokenStorage.getByUsernameToken(verifiedToken.username)
   //сравнение токена из куков и хэшированого токена из базы
      console.log(storedToken);
      
      const comparedTokens = await bcrypt.compare(refreshToken, storedToken.token)
      if(!comparedTokens){
         throwValidationError('Токены не совпадают')
      }

      const payload = { admin_id: verifiedToken.admin_id, username: verifiedToken.username, role: verifiedToken.role };
      const tokens = TokenService.generateTokens(payload);
      await TokenStorage.deleteToken(verifiedToken.username);
      const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
      await TokenStorage.setToken(storedToken.username, storedToken.role, hashedRefreshToken);

      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = [
         `refreshToken=${tokens.refreshToken}`,
         'HttpOnly',
         isProduction ? 'Secure' : '',
         'SameSite=Strict',
         `Max-Age=${7 * 24 * 60 * 60}` // 7 дней в секундах
      ].filter(Boolean).join('; ');

      res.setHeader('Set-Cookie', cookieOptions);

      return { accessToken: tokens.accessToken };

}
const check = async (accessToken) => {

   let is_alive = false
   try {
      const decodedToken = TokenService.verifyAccessToken(accessToken)
      is_alive =  true
      return is_alive
   } catch (error) {
      return is_alive
   }

}

module.exports = {toRefreshToken, check}