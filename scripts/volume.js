const mysql = require('mysql2');
const dotenv = require('dotenv');
const moment = require('moment');
const util = require('util');
const uuid = require('uuid');

dotenv.config();
const connection = mysql.createConnection({
  host: process.env.TYPEORM_HOST,
  port: process.env.TYPEORM_PORT,
  user: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
});

const operationVolQuery = `
SELECT o.id                                                               AS id,
      DATE(orders.completed_time)                                         AS createTime,
      SUM(CASE WHEN orders.status = 4 THEN orders.total_price ELSE 0 END) AS totalAmount,
      SUM(orders.total_fee)                                               AS totalFee,
      SUM(orders.total_penalty_fee)                                       AS totalPenaltyFee,
      SUM(CASE WHEN orders.type = 'BUY' THEN 1 ELSE 0 END)                AS totalBuyOrder,
      SUM(CASE WHEN orders.type = 'SELL' THEN 1 ELSE 0 END)               AS totalSellOrder,
      SUM(CASE WHEN orders.status = 4 THEN 1 ELSE 0 END)                  AS totalSuccessOrder,
      SUM(CASE
              WHEN orders.status = 5 AND orders.appeal_id IS NOT NULL THEN 1
              ELSE 0 END)                                                 AS totalOrderCancelled,
      SUM(CASE
              WHEN orders.appeal_id IS NOT NULL AND appeals.admin_id IS NOT NULL THEN 1
              ELSE 0 END)                                                 AS totalOrderAppeal
FROM orders
        JOIN operations o on orders.merchant_id = o.id
        LEFT JOIN appeals ON orders.appeal_id = appeals.id
WHERE orders.status = 4
  OR (orders.status = 5 AND orders.appeal_id IS NOT NULL AND appeals.decision_result != 5)
GROUP BY o.id, DATE(orders.completed_time)
`;

connection.connect(async (err) => {
  if (err) {
    console.log(err);
    return;
  }
  const query = util.promisify(connection.query).bind(connection);

  const querySumVolume = (objField, objValue) => `
      DATE(orders.completed_time) AS createTime,
      SUM(CASE WHEN orders.status = 4 THEN orders.total_price ELSE 0 END) AS totalAmount,
      SUM(orders.total_fee) AS totalFee,
      SUM(orders.total_penalty_fee) AS totalPenaltyFee,
      SUM(CASE WHEN orders.type = 'BUY' THEN 1 ELSE 0 END) AS totalBuyOrder,
      SUM(CASE WHEN orders.type = 'SELL' THEN 1 ELSE 0 END) AS totalSellOrder,
      SUM(CASE WHEN orders.status = 4 THEN 1 ELSE 0 END) AS totalSuccessOrder,
      SUM(CASE WHEN orders.status = 5 AND orders.appeal_id IS NOT NULL THEN 1 ELSE 0 END) AS totalOrderCancelled,
      SUM(CASE WHEN orders.appeal_id IS NOT NULL AND appeals.admin_id IS NOT NULL THEN 1 ELSE 0 END) AS totalOrderAppeal
    FROM orders
    LEFT JOIN appeals ON orders.appeal_id = appeals.id
    WHERE orders.${objField} = '${objValue}' AND (orders.status = 4 OR (orders.status = 5 AND orders.appeal_id IS NOT NULL AND appeals.decision_result != 5))
    GROUP BY DATE(orders.completed_time)
  `;
  const queryUpdateVolume = (data) => `
  SET
      number_transaction_sell = ${Number(data.totalSellOrder) || 0},
      number_transaction_buy = ${Number(data.totalBuyOrder) || 0},
      number_transaction_success = ${Number(data.totalSuccessOrder) || 0},
      amount_transaction = ${Number(data.totalAmount) || 0},
      total_fee = ${Number(data.totalFee || 0)},
      total_penalty_fee = ${Number(data.totalPenaltyFee || 0)},
      number_transaction_cancelled = ${Number(data.totalOrderCancelled || 0)},
      number_transaction_appeal = ${Number(data.totalOrderAppeal || 0)}
  `;
  const users = await query('SELECT id from users');
  await Promise.all(
    users.map(async (data) => {
      const sumOrderByDays = await query(`SELECT ${querySumVolume('user_id', data.id)}`);
      await Promise.all(
        sumOrderByDays.map(async (volume) => {
          const date_trans = moment(volume.createTime).format('YYYY-MM-DD');
          const countQuery = await query(
            `SELECT COUNT(*) as count from volume WHERE volume.user_id = '${data.id}' AND DATE(date_trans) = DATE('${date_trans}')`
          );
          if (countQuery[0].count) {
            return query(`
              UPDATE volume
              ${queryUpdateVolume(volume)}
              WHERE volume.user_id = '${data.id}' AND DATE(volume.date_trans) = DATE('${date_trans}')
            `);
          }
          return query(`
          INSERT volume
          ${queryUpdateVolume(volume)},
          id = '${uuid.v4()}',
          user_id = '${data.id}',
          date_trans = DATE('${date_trans}')
        `);
        })
      );
    })
  );

  const operationVols = await query(operationVolQuery);
  await Promise.all(
    operationVols.map(async (operationVol) => {
      const date_trans = moment(operationVol.createTime).format('YYYY-MM-DD');
      const count = await query(
        `SELECT COUNT(*) as count from volume WHERE volume.operation_id = '${operationVol.id}' AND DATE(date_trans) = DATE('${date_trans}')`
      );
      if (count[0].count) {
        return query(`
              UPDATE volume
              ${queryUpdateVolume(operationVol)}
              WHERE volume.operation_id = '${operationVol.id}' AND DATE(volume.date_trans) = DATE('${date_trans}')
            `);
      }
      return query(`
          INSERT volume
          ${queryUpdateVolume(operationVol)},
          id = '${uuid.v4()}',
          operation_id = '${operationVol.id}',
          date_trans = DATE('${date_trans}')
        `);
    })
  );
  process.exit(0);
});
