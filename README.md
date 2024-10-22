## Installation

Use npm to install all the package modules

```bash
npm install
```

## User Database 

In MySQL, create a database called ```user_db``` and inside that database, create a table called ```user```:
```
CREATE DATABASE user_db;

CREATE TABLE user(
 name varchar(50) NOT NULL,
 phonenumber varchar(50) PRIMARY KEY NOT NULL,
 email varchar(50),
 password varchar(50) NOT NULL
);
```


## Database Connection
```
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Sidwick@@99',
  database: 'user_db',
  port: 3306
})
```
change the user, password and port values, incase If the connection is not successful.


### Global Database

In MySQL, create another database called ```global_db``` and inside that database, create a table ```global_database```

```
CREATE TABLE global_database (
  global_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  phonenumber VARCHAR(15) NOT NULL,
  email VARCHAR(255),
  spam_likelihood INT
);
```

To Insert random data into ```global_database```, execute this query:

```
INSERT INTO global_database (name, phonenumber, email, spam_likelihood)
SELECT
  CONCAT('User', id),
  CONCAT('555', LPAD(FLOOR(RAND() * 1000000000), 7, '0')), -- Ensure 10-digit phone numbers
  CONCAT('user', id, '@example.com'),
  FLOOR(RAND() * 3) -- Random spam likelihood (0, 1, or 2)
FROM
  (SELECT ROW_NUMBER() OVER () AS id FROM information_schema.tables LIMIT 100) AS ids;
```

## Global database connection

```
const globalDbConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Sidwick@@99',
  database: 'global_db',
  port: 3306
});

```
If you face any error, try to change the port value

## Executing Program
To run the project, run this command from the project folder.

```
node index.js
```


