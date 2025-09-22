
const throwValidationError = require('../../lib/ValidationError')
const { processMultipart } = require('../../lib/multipartParser')
const db = require('../../db')
const dishes = db('dish')
const safeDbCall = require('../../lib/safeDbCall')
const { promises: fs } = require('fs')
const path = require('path')

const createDish = async (rawBody) => {
      const boundary = rawBody.headers['content-type'].split('boundary=')[1]
      if (!boundary) throwValidationError('Invalid multipart/form-data')

      const { fields, files } = await processMultipart(rawBody.body, boundary)

      const imageFile = files.find(f => f.name === 'image') 
      const imagePath = imageFile ? imageFile.filename : null

      if (imageFile) {
               const FilePath = path.join(__dirname, '../../../uploads', imageFile.filename);
               try {
                  await fs.writeFile(FilePath, imageFile.data);
                  console.log('New file written:', FilePath);
               } catch (err) {
                  throwValidationError('Ошибка при записи нового фото');
               }
            }

      const {name, price ,description ,composition, categoryid, dish_weight } = fields
      
      const dish = {
         name, 
         price,
         description,
         composition,
         categoryid,
         dish_weight,
         image: imagePath
      }

      console.log(dish);

      return (await safeDbCall(() => dishes.create(dish)))
}

module.exports = createDish