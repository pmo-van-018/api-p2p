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
connection.connect(async (err) => {
    if (err) {
        console.log(err)
        return;
    }
    const query = util.promisify(connection.query).bind(connection);

    console.log('Operations updating...');
    const nickNameDuplicates = await query(`SELECT nick_name FROM operations GROUP BY nick_name HAVING COUNT(*) > 1`)
    if (!nickNameDuplicates?.length) {
        process.exit(0);
    }
    const nickNameParams = nickNameDuplicates.map(e => "'"+ e.nick_name + "'").join(',');
    await query("UPDATE operations SET nick_name = CONCAT(nick_name, SUBSTR(wallet_address, 1, 4)) WHERE nick_name IN (" + nickNameParams + ")")

  process.exit(0);
})
