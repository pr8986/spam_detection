import mysql from 'mysql';
import dotenv from 'dotenv';
dotenv.config();
//Database connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'user_db',
  port: process.env.XAMP_PORT
})

connection.connect(function(err){
  if (err) throw err;
  console.log('User Database Connected Successfully.');
});

export default connection;