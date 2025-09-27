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

      let {name,description ,dish_weight , composition, categoryid, dish_status, resize, size} = fields
      
      const dish = {
         ...(name && { name }), 
         ...(description !== undefined && { description }),
         ...(dish_weight && { dish_weight }),
         ...(composition && { composition }),
         ...(categoryid && { categoryid: parseInt(categoryid) }),
         ...(imagePath && { image: imagePath }),
         ...(dish_status !== undefined && { dish_status: dish_status === '1' || dish_status === 'true' || dish_status === true })
      }

      if (resize !== undefined) {
         dish.resize = resize === 'true' || resize === '1' || resize === true;
         if (!dish.resize && size) {
            // Optionally reset size to empty if resize is false
            size = '{}';
         }
      }

      if (size) {
         try {
            dish.size = JSON.parse(size);
         } catch (e) {
            throwValidationError('Неверный формат JSON для size');
         }
      }

      console.log(dish);

      return (await safeDbCall(() => dishes.create(dish)))
}

module.exports = createDish