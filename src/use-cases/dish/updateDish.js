
const throwValidationError = require('../../lib/ValidationError')
const { processMultipart } = require('../../lib/multipartParser')
const db = require('../../db')
const dishes = db('dish')
const safeDbCall = require('../../lib/safeDbCall')
const { promises: fs } = require('fs')
const path = require('path')

const updateDish = async (rawBody) => {
      const boundary = rawBody.headers['content-type'].split('boundary=')[1]
      if (!boundary) throwValidationError('Invalid multipart/form-data')

      const { fields, files } = await processMultipart(rawBody.body, boundary)

      const imageFile = files.find(f => f.name === 'image') 
      const imagePath = imageFile ? imageFile.filename : null
      
      let {id, name, price, description, dish_weight, composition, categoryid, dish_status} = fields

      const existing_dish = await safeDbCall(() => dishes.read(id))
    
      if(existing_dish.length < 1){
        throw  new Error(`Нет блюда с id: ${id}`)
      }
      
      if (imagePath){
        if (existing_dish[0].image && existing_dish[0].image.length > 0) {
                    const filePath = path.join(__dirname, '../../../uploads', existing_dish[0].image)
                    try {
                       await fs.access(filePath)
                       await fs.unlink(filePath)
                    } catch (err) {
                      console.log('Фото нет')
                    }
                 }
      }

      if (imageFile) {
         const FilePath = path.join(__dirname, '../../../uploads', imageFile.filename);
         try {
            await fs.writeFile(FilePath, imageFile.data);
            console.log('New file written:', FilePath);
         } catch (err) {
            throwValidationError('Ошибка при записи нового фото');
         }
      }
      
      
      if (dish_status == 0)
      {
        dish_status = 0
      } else {
        dish_status = 1
      }

      const dish = {   
         name, 
         price,
         description,
         dish_weight,
         composition,
         categoryid,
         dish_status
      }
      
      if (imagePath) {
         dish.image = imagePath
      }
      
      return await safeDbCall(() => dishes.update(id, dish))
}

module.exports = updateDish
