const mysql = require('mysql2')
const dotenv = require('dotenv')
const util = require('util')
const generator = require('voucher-code-generator')

dotenv.config()

const connection = mysql.createConnection({
  host: process.env.TYPEORM_HOST,
  port: process.env.TYPEORM_PORT,
  user: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
})
connection.connect(async (err) => {
  if (err) {
    console.log(err)
    return;
  }
  const query = util.promisify(connection.query).bind(connection);

  // Users
  console.log('Referral code updating...');
  const users = await query('SELECT * FROM users WHERE referral_code IS NULL')

  await Promise.all(
    users.map(async (data, index) => {
      const code = generator.generate({
        length: 8,
        count: 1,
        charset: generator.charset('alphanumeric')
      })[0];
      if (code) {
        return query(`
          UPDATE users
          SET referral_code = '${code}', is_referred = true
          WHERE id = '${data.id}';
        `)
      }
      console.log('Can\'t set Referral code for user', data.id);
    })
  )
  process.exit(0);
})
