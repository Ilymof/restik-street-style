const throwValidationError = require('../../lib/ValidationError')
const { processMultipart } = require('../../lib/multipartParser')
const db = require('../../db')
const dishes = db('dish')
const safeDbCall = require('../../lib/safeDbCall')
const {UpdateDishesSchema} = require('../../schemas/dishesMetaSchema')
const { promises: fs } = require('fs')
const path = require('path')
const parseBoolean = require('../../lib/Parsing')
const updateDish = async (rawBody) => {
      const boundary = rawBody.headers['content-type'].split('boundary=')[1]
      if (!boundary) throwValidationError('Invalid multipart/form-data')

      const { fields, files } = await processMultipart(rawBody.body, boundary)

      const imageFile = files.find(f => f.name === 'image') 
      const imagePath = imageFile ? imageFile.filename : null
      
      let {id, name, description, composition, categoryid, dish_status, default_characteristics, characteristics, position } = fields

      const existing_dish = await safeDbCall(() => dishes.read(id))
    
      if(existing_dish.length < 1){
        throwValidationError(`Нет блюда с id: ${id}`)
      }
      
    if (composition && typeof composition === 'string') {
        try {
            composition = JSON.parse(composition);
            if (!Array.isArray(composition)) {
                throwValidationError("composition должен быть массивом строк");
            }
        } catch (e) {
            throwValidationError(`Неверный JSON в composition: ${e.message}`);
        }
    }

      if (characteristics && typeof characteristics === 'string') {
         try {
            characteristics = JSON.parse(characteristics);

            if (Array.isArray(characteristics)) {
               characteristics = characteristics.map(char => ({
                  size: char.size,
                  price: char.price,  
                  quantity: char.quantity, 
                  measure: char.measure
               }));
            }
         } catch (e) {
            throwValidationError(`Неверный JSON в characteristics: ${e.message}`);
         }
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

      
    
      const dish = {   
         ...(name && { name }), 
         ...(description !== undefined && { description }),
         ...(composition && { composition }),
         ...(categoryid && { categoryid: parseInt(categoryid) }),
         ...(dish_status && { dish_status: parseBoolean(dish_status)}),
         ...(characteristics && {characteristics}),
         ...(default_characteristics && {default_characteristics: parseInt(default_characteristics)}),
         ...(position && {position: parseInt(position)})
      }
      console.log(dish);
      
        if(!id){
            throwValidationError('Отсутствует id блюда');
        }
        if (Object.keys(dish).length === 0) {
            throwValidationError('Нет данных для обновления');
        }
        const validationDish ={
        id: parseInt(id),
            ...dish
        }

      if(!UpdateDishesSchema.check(validationDish).valid){
         throwValidationError(UpdateDishesSchema.check(validationDish).errors[0])
      }

      if (characteristics !== undefined) {
         dish.characteristics = JSON.stringify(characteristics);
      }

      if (imagePath) {
         dish.image = imagePath
      }
      
     const result = await safeDbCall(() => dishes.update(id, dish))
      if (imageFile) {
         const FilePath = path.join(__dirname, '../../../uploads', imageFile.filename);
         try {
            await fs.writeFile(FilePath, imageFile.data);
            console.log('New file written:', FilePath);
         } catch (err) {
            throwValidationError('Ошибка при записи нового фото');
         }
      }
      return result
}

module.exports = updateDish
