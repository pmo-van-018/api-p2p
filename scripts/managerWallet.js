const mysql = require('mysql2');
const dotenv = require('dotenv');
const { v4 } = require('uuid');

dotenv.config();

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: process.env.TYPEORM_HOST,
  port: process.env.TYPEORM_PORT,
  user: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
});

console.log('Connected to the database successfully!');

connection.connect(async (err) => {
  if (err) {
    console.log(err);
    return;
  }
  connection.beginTransaction(function (err) {
    if (err) {
      throw err;
    }
    connection.query('SELECT wallet_address, id FROM operations WHERE type = 3', function (err, results) {
      if (err) {
        connection.rollback(function () {
          throw err;
        });
      }
      if (!results.length) {
        return;
      }
      results.forEach(function (result) {
        connection.query(
          'INSERT INTO wallet_address_managements (id, wallet_address, operation_id, status) VALUES (?, ?, ?, ?)',
          [v4(), result.wallet_address, result.id, 'ACTIVE'],
          function (err, result) {
            if (err) {
              connection.rollback(function () {
                throw err;
              });
            }
          }
        );
      });
      connection.commit(function (err) {
        if (err) {
          connection.rollback(function () {
            throw err;
          });
        }
        console.log('Wallet addresses migrated successfully.');
        connection.end();
      });
    });
  });
});
