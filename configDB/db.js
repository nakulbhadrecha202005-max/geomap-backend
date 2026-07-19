// // db.js
const mongoose = require('mongoose')

const mongodb_Url = 'mongodb+srv://mongodblearning20_db_user:VuIlDHcuWTbwF14r@nakul.7aqwd0d.mongodb.net/BCASEM7?appName=BCASEM7'

mongoose.connect(mongodb_Url).then(() => {
  console.log('Connection Success')
}).catch((err) => {
  console.log(err)
})
