import mysql from 'mysql';
import dotenv from 'dotenv';
dotenv.config();



const globalDbConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'global_db',
  port: process.env.XAMP_PORT
});

globalDbConnection.connect(function(err){
  if (err) throw err;
  console.log('Global Database Connected Successfully.');
});

export default globalDbConnection;