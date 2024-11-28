import mysql from 'mysql';

//Database connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'user_db',
  port: 3307
})

connection.connect(function(err){
  if (err) throw err;
  console.log('User Database Connected Successfully.');
});

export default connection;