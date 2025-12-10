'use strict'
const db = require('../../db')
const safeDbCall = require('../../lib/safeDbCall')
const config = db('config')
const {invalidateOpeningHoursCache} = require('../../lib/checkOpeningHours')
const throwValidationError = require('../../lib/ValidationError')

const changeWorkTime = async (args) => {
    const {opens_at, closes_at} = args
      const existingTime = await safeDbCall(() => config.read(1))
      
      if (!existingTime || existingTime.length < 1) {
         throwValidationError(`Время с id ${id} не найдено`)
      }

      const values = {
        opens_at,
        closes_at   
      }

      const result = await safeDbCall(() => config.update(1, values))
      if (!result) {
         throwValidationError('Ошибка при обновлении времени')
      }
      invalidateOpeningHoursCache()
      return result 
}

module.exports = changeWorkTime 