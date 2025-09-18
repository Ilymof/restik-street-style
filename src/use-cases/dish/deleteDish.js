'use strict'
const { promises: fs } = require('fs')
const path = require('path')
const errorHandler = require('@lib/errorHandler')
const db = require('../../db')
const dishes = db('dish')
const safeDbCall = require('../../lib/safeDbCall.js')


const deleteDish = async (args) => { 
      let {dishId} = args 
      if(!dishId){
         throw new Error("Отсутсвует id в параметрах")
      }
      dishId = parseInt(dishId)
 
      const dish = await safeDbCall(() => dishes.read(dishId))
      console.log(dish);
      
      if (dish.length < 1) {
         throw new Error(`Не существует блюда с id ${dishId}`)
      }
      console.log(dish[0].image);
      
      if (dish[0].image && dish[0].image.length > 0) {
            const filePath = path.join(__dirname, '../../../uploads', dish[0].image)
            
            console.log("filePath:" + filePath);  
            try {
               await fs.access(filePath)
               await fs.unlink(filePath)
            } catch (err) {
               throw new Error('Ошибка при удалении фото')
            }
         }

      await safeDbCall(() => dishes.delete(dishId))
      console.log("Блюдо было удаленно")
}

module.exports = deleteDish