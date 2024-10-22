import mysql from 'mysql';

//Database connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Sidwick@@99',
  database: 'user_db',
  port: 3306
})

connection.connect(function(err){
  if (err) throw err;
  console.log('User Database Connected Successfully.');
});

export default connection;