const mysql = require('mysql2')
const dotenv = require('dotenv')
const util = require('util')
const axios = require('axios')

const OperationType = {
  SUPER_ADMIN: 2,
  MERCHANT_MANAGER: 3,
  MERCHANT_OPERATOR: 4,
  MERCHANT_SUPPORTER: 5,
  ADMIN_SUPPORTER: 6,
}

dotenv.config()

const getChatApiHeader = () => {
  return {
    [process.env.CHAT_PREFIX_HEADER]: `${process.env.CHAT_API_KEY}:${process.env.CHAT_API_KEY_HASH}`,
    'Content-Type': 'application/json',
  }
}
const getPeerChatId = async (type) => {
  try {
    const url = `${process.env.CHAT_TARGET_DOMAIN}api/bot/users/create`;
    const response = await axios.post(url, { type }, { headers: getChatApiHeader() });
    return response.data.data._id;
  } catch (e) {
    return null;
  }
}

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
  console.log('Users updating...');
  const users = await query('SELECT * FROM users WHERE peer_chat_id IS NULL')
  await Promise.all(
    users.map(async data => {
      const peerChatId = await getPeerChatId('USER');
      if (peerChatId) {
        return query(`
          UPDATE users
          SET peer_chat_id = '${peerChatId}'
          WHERE id = '${data.id}';
        `)
      }
      console.log('Can\'t set peer chat id for user', data.id);
    })
  )

  // Operations
  console.log('Operations updating...');
  adminTypes = [OperationType.SUPER_ADMIN, OperationType.ADMIN_SUPPORTER];
  const operations = await query('SELECT * FROM operations WHERE peer_chat_id IS NULL')
  await Promise.all(
    operations.map(async data => {
      const peerChatId = await getPeerChatId(adminTypes.includes(data.type) ? 'ADMIN' : 'USER');
      if (peerChatId) {
        return query(`
          UPDATE operations
          SET peer_chat_id = '${peerChatId}'
          WHERE id = '${data.id}';
        `)
      }
      console.log('Can\'t set peer chat id for operation', data.id);
    })
  )

  process.exit(0);
})
