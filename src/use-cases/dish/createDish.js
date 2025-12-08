const throwValidationError = require('../../lib/ValidationError')
const { processMultipart } = require('../../lib/multipartParser')
const db = require('../../db')
const dishes = db('dish')
const safeDbCall = require('../../lib/safeDbCall')
const { promises: fs } = require('fs')
const path = require('path')
const {CreateDishesSchema} = require('../../schemas/dishesMetaSchema')

const createDish = async (rawBody) => {
      const boundary = rawBody.headers['content-type'].split('boundary=')[1]
      if (!boundary) throwValidationError('Invalid multipart/form-data')

      const { fields, files } = await processMultipart(rawBody.body, boundary)

      const imageFile = files.find(f => f.name === 'image') 
      const imagePath = imageFile ? imageFile.filename : null
      
      let {name, description, composition, category_id, default_characteristics, characteristics, position} = fields  

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
      console.log(category_id, position, default_characteristics);
      
      
      const dish = {
         name, 
         description,
         composition,
         category_id: category_id ? parseInt(category_id) : undefined,
         image: imageFile ? imagePath : undefined,
         dish_status: true,
         default_characteristics: default_characteristics ? parseInt(default_characteristics) : undefined,
         characteristics,
         position: position ? parseInt(position) : undefined
      }
      
      if(!CreateDishesSchema.check(dish).valid){
      throwValidationError(CreateDishesSchema.check(dish).errors[0])
      }
      
      dish.characteristics = JSON.stringify(characteristics)
      let result = []

      if (imageFile) {
               const FilePath = path.join(__dirname, '../../../uploads', imageFile.filename);
               try {
                  await fs.writeFile(FilePath, imageFile.data);
                  result = await safeDbCall(() => dishes.create(dish))
                  console.log('New file written:', FilePath);
               } catch (err) {
                  throwValidationError('Ошибка при записи нового фото', err.message);
               }
            }
      return result
}

module.exports = createDish