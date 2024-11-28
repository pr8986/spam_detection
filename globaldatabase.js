import mysql from 'mysql';

const globalDbConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'global_db',
  port: 3307
});

globalDbConnection.connect(function(err){
  if (err) throw err;
  console.log('Global Database Connected Successfully.');
});

export default globalDbConnection;