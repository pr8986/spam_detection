import express from "express";
import {dirname} from "path";
import path from 'path';
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import connection from './userdatabase.js';
import globalDbConnection  from "./globaldatabase.js";
import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();



const app = express();
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

//body parser middleware. with this, we can easily tap into requests body.
app.use(bodyParser.urlencoded({extended: true}));

//To display EJS files.
app.set('views', path.join(__dirname, 'views'));

//Display index page.
app.get('/',(req,res)=> {
  res.sendFile(__dirname + '/pages/index.html');
})

//Registration page
app.get('/registration',(req,res) => {
  res.sendFile(__dirname + '/pages/registration.html');
})

//Registration form
app.post('/register', (req, res) => {
  const name = req.body['name'];
  const number = req.body['phone-number'];
  const email = req.body['email'];
  const password = req.body['password'];

  //check if the user already exists in db, if exists displays login page, if not creates a new profile.
  const checkUserQuery = `SELECT * FROM user WHERE phonenumber = '${number}'`;
  connection.query(checkUserQuery, (err, results) => {
    if (err) {
      throw err;
    }
    if (results.length > 0) {
      res.sendFile(__dirname + '/pages/user-exists.html');
    } else {
      const insertUserQuery = `INSERT INTO user(name,phonenumber,email,password) VALUES ('${name}','${number}','${email}','${password}')`;
      connection.query(insertUserQuery,(err) => {
        if (err) {
          throw err;
        }
        res.sendFile(__dirname + '/pages/registration-200.html');
      });
    }
  });
});

//Displays login page
app.get('/login',(req,res)=>{
  res.sendFile(__dirname + '/pages/login.html')
})

//check if the user has profile in db or not. if not, displays registration page.
app.post('/login', (req, res) => {
  const number = req.body['phone-number'];
  const password = req.body['password'];
  const checkUser = `SELECT * FROM user WHERE phonenumber = '${number}' AND password = '${password}'`;
  connection.query(checkUser,(err,results) => {
    if(err) throw err;
    if(results.length === 0 || password !== results[0].password){
      res.sendFile(__dirname + '/pages/user-not-exists.html');
    }else {
      res.sendFile(__dirname + '/pages/dashboard.html');
    }
  })
});


//fetch data by name and number
app.post('/fetch', (req,res) => {
  const name = req.body['name'];
  const number = req.body['phone-number'];
  if(name.length > 0 && number.length === 0){
    const searchByName = `SELECT * FROM global_database WHERE name LIKE '%${name}%'`;
    globalDbConnection.query(searchByName, (err,results) => {
      if(err){
        throw err;
      }else{
        res.render('search-name-data.ejs', {data:results});  
      }
    });
  } else {
    const searchByNumber = `SELECT * FROM user WHERE phonenumber = '${number}'`;
    connection.query(searchByNumber, (err,results) => {
      if(err){
        throw err;
      }
      if(results.length > 0){
        res.render('search-number-data.ejs', {data:results});
      }else{
        const searchInGlobalDb = `SELECT * FROM global_database WHERE phonenumber = '${number}'`;
        globalDbConnection.query(searchInGlobalDb, (err,results) => {
          if(err) throw err;
          res.render('search-number-data.ejs', {data:results});
        })
      }
    });
  }
});

//report spam
app.post('/report-spam', (req,res) => {
  const value = req.body['spamReport'];
  const number = req.body['phoneNumber'];
  //console.log(value,number);
  if(value === 'Yes'){
    const updateQuery = `UPDATE global_database SET spam_likelihood = spam_likelihood + 1 WHERE phonenumber = '${number}'`;
    globalDbConnection.query(updateQuery, (err,results) => {
      if(err) throw err;
      res.sendFile(__dirname + '/pages/spam.html');
    })
  }else {
    const updateQuery = `UPDATE global_database SET spam_likelihood = spam_likelihood - 1 WHERE phonenumber = '${number}'`;
    globalDbConnection.query(updateQuery, (err,results) => {
      if(err) throw err;
      res.sendFile(__dirname + '/pages/spam.html');
    })
  }
})

const dbConfig = {
  host: 'localhost',
  user: 'root', 
  password: '', 
  port: process.env.XAMP_PORT

};

// Connect to MySQL Server
const connection2 = mysql.createConnection(dbConfig);

connection2.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    return;
  }
  console.log('Connected to MySQL Server.');
});

app.get('/initialize', async (req, res) => {
  try {
    // CREATE DATABASE user_db
    await connection2.promise().query(`CREATE DATABASE IF NOT EXISTS user_db;`);
    console.log('Database user_db created.');

    // CREATE TABLE user
    await connection2.promise().query(`
      CREATE TABLE IF NOT EXISTS user_db.user (
        name VARCHAR(50) NOT NULL,
        phonenumber VARCHAR(50) PRIMARY KEY NOT NULL,
        email VARCHAR(50),
        password VARCHAR(50) NOT NULL
      );
    `);
    console.log('Table user created.');

    // CREATE DATABASE global_db
    await connection2.promise().query(`CREATE DATABASE IF NOT EXISTS global_db;`);
    console.log('Database global_db created.');

    // CREATE TABLE global_database
    await connection2.promise().query(`
      CREATE TABLE IF NOT EXISTS global_db.global_database (
        global_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        phonenumber VARCHAR(15) NOT NULL,
        email VARCHAR(255),
        spam_likelihood INT
      );
    `);
    console.log('Table global_database created.');

    // INSERT INTO global_database
    await connection2.promise().query(`
      INSERT INTO global_db.global_database (name, phonenumber, email, spam_likelihood)
      SELECT
        CONCAT('User', id),
        CONCAT('555', LPAD(FLOOR(RAND() * 1000000000), 7, '0')),
        CONCAT('user', id, '@example.com'),
        FLOOR(RAND() * 3)
      FROM
        (SELECT ROW_NUMBER() OVER () AS id FROM information_schema.tables LIMIT 100) AS ids;
    `);
    console.log('Sample data inserted into global_database.');

    res.send('Databases and tables initialized successfully.');
  } catch (error) {
    console.error('Error initializing databases and tables:', error.message);
    res.status(500).send('Error initializing databases and tables.');
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});