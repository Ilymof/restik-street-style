
const errorHandler = require('../../lib/errorHandler')
const { processMultipart } = require('../../lib/multipartParser')
const db = require('../../db')
const dishes = db('dish')
const safeDbCall = require('../../lib/safeDbCall')
const { promises: fs } = require('fs')
const path = require('path')

const createDish = async (rawBody) => {
   try {
      const boundary = rawBody.headers['content-type'].split('boundary=')[1]
      if (!boundary) throw new Error('Invalid multipart/form-data')

      const { fields, files } = await processMultipart(rawBody.body, boundary)

      const imageFile = files.find(f => f.name === 'image') 
      const imagePath = imageFile ? imageFile.filename : null

      if (imageFile) {
               const FilePath = path.join(__dirname, '../../../uploads', imageFile.filename);
               try {
                  await fs.writeFile(FilePath, imageFile.data);
                  console.log('New file written:', FilePath);
               } catch (err) {
                  throw new Error('Ошибка при записи нового фото' + err.message);
               }
            }

      const {name, price ,description ,time_to_cook ,dish_weight, composition, categoryid } = fields

      
      
      const dish = {
         name, 
         price,
         description,
         time_to_cook,
         dish_weight,
         composition,
         categoryid,
         image: imagePath
      }

      console.log(dish);

      return (await safeDbCall(() => dishes.create(dish)))

   } catch (error) {
      throw errorHandler(error)
   }
}

module.exports = createDish