const readline = require('readline');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const util = require('util');

const { hash } = require('./utils');

const DEFAULT_PASSWORD = '12345678';

dotenv.config();

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: process.env.TYPEORM_HOST,
  port: process.env.TYPEORM_PORT,
  user: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('What are your user? ', function (username) {
  connection.connect(async (err) => {
    if (err) {
      console.log(err);
      return;
    }

    const query = util.promisify(connection.query).bind(connection);

    const existsUsers = await query(
      `select id from user_password where user_password.username = '${username}' limit 1`
    );
    if (!existsUsers.length) {
      console.warn(`User "${username}" not found.`);
      rl.close();
    }

    await query(
      `update user_password set password = '${await hash(
        DEFAULT_PASSWORD
      )}' where user_password.username = '${username}'`
    );

    console.log(`Success refresh password!!!. Your password is: ${DEFAULT_PASSWORD}`);

    rl.close();
  });
});

rl.on('close', function () {
  process.exit(0);
});
