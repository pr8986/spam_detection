import express from "express";
import {dirname} from "path";
import path from 'path';
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import connection from './userdatabase.js';
import globalDbConnection  from "./globaldatabase.js";

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

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});