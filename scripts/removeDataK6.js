const mysql = require('mysql2')
const dotenv = require('dotenv')
const util = require('util')

dotenv.config()

const connection = mysql.createConnection({
  host: process.env.TYPEORM_HOST,
  port: process.env.TYPEORM_PORT,
  user: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
})

const operatorWalletAddress = '0x2472EA96B554B5c48ab20595E47cCAE56f3865C6'

connection.connect(async (err) => {
  if (err) {
    console.log(err)
    return;
  }
  const query = util.promisify(connection.query).bind(connection);

  const operators = await query('SELECT * FROM operations WHERE wallet_address = ?', [operatorWalletAddress])
  if (!operators?.length) {
    console.log('Operator not found');
    process.exit(0);
  }
  const operator = operators[0];
  await query('UPDATE posts SET status = 2 WHERE merchant_id = ?', [operator.id])
  console.log('Posts closed');
  process.exit(0);
})
