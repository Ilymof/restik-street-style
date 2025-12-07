'use strict'
const { promises: fs } = require('fs')
const path = require('path')
const errorHandler = require('@lib/errorHandler')
const db = require('../../db')
const dishes = db('dish')
const safeDbCall = require('../../lib/safeDbCall.js')
const throwValidationError = require('../../lib/ValidationError')

const deleteDish = async (args) => { 
      let {dishId} = args 
      if(!dishId){
         throwValidationError("Отсутсвует id в параметрах")
      }
      dishId = parseInt(dishId)
 
      const dish = await safeDbCall(() => dishes.read(dishId))
      console.log(dish);
      
      if (dish.length < 1) {
         throwValidationError(`Не существует блюда с id ${dishId}`)
      }
      const imageName = dish[0].image
      
      if (dish[0].image && dish[0].image.length > 0) {
            const filePath = path.join(__dirname, '../../../uploads', dish[0].image)
            
            console.log("filePath:" + filePath);  
            try {
               await fs.access(filePath)
               await fs.unlink(filePath)
            } catch (err) {
               if (err.code === 'ENOENT') {
                  console.log(`Фото не найдено на диске, пропускаем: ${imageName}`)
               }else{throwValidationError('Ошибка при удалении фото')}  
            }
         }

      await safeDbCall(() => dishes.delete(dishId))
      console.log("Блюдо было удаленно")
}

module.exports = deleteDish