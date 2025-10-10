const mysql = require('mysql2');
const dotenv = require('dotenv');
const util = require('util');
const axios = require('axios');

const axiosInstance = axios.create({
  baseURL: process.env.CHAT_TARGET_DOMAIN,
});

const OrderStatus = {
  TO_BE_PAID: 1,
  CONFIRM_PAID: 2,
  PAID: 3,
  COMPLETED: 4,
  CANCELLED: 5,
};

const ParticipantRole = {
  VIEWER: 'VIEWER',
  MEMBER: 'MEMBER',
  OWNER: 'OWNER',
};

dotenv.config();

const getChatApiHeader = () => {
  return {
    [process.env.CHAT_PREFIX_HEADER]: `${process.env.CHAT_API_KEY}:${process.env.CHAT_API_KEY_HASH}`,
    'Content-Type': 'application/json',
  };
};
const addChat = async (payload) => {
  try {
    const path = `/api/bot/rooms/add-chat`;
    await axiosInstance.post(path, payload, { headers: getChatApiHeader() });
  } catch (err) {
    console.error('Failed to add chat: ', err);
    return null;
  }
};

const connection = mysql.createConnection({
  host: process.env.TYPEORM_HOST,
  port: process.env.TYPEORM_PORT,
  user: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
});
connection.connect(async (err) => {
  if (err) {
    console.log(err);
    return;
  }
  const query = util.promisify(connection.query).bind(connection);

  console.log('Adding merchant manager to room chat...');
  const activeOrders = await query(`
    select orders.room_id        \`room_id\`,
           operator.id           \`operator_id\`,
           operator.peer_chat_id \`operator_peer_chat_id\`,
           manager.id            \`manager_id\`,
           manager.peer_chat_id  \`manager_peer_chat_id\`
    from orders
             inner join operations operator on orders.merchant_id = operator.id
             inner join operations manager on operator.merchant_manager_id = manager.id
    where orders.status in (1, 2, 3)
      and room_id is not null;
`);

  await Promise.all(
    activeOrders.map(async (o) => {
      const participants = [
        {
          userId: o['manager_peer_chat_id'],
          role: ParticipantRole.VIEWER,
        },
      ];
      await addChat({
        roomId: o['room_id'],
        participants,
      });
      console.log(
        `Success adding merchant manager **${o['manager_id']}** with peerId **${o['manager_peer_chat_id']}** into room **${o['room_id']}**`
      );
    })
  );

  process.exit(0);
});
