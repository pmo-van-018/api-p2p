const mysql = require('mysql2');
const dotenv = require('dotenv');
const moment = require('moment');
const util = require('util');

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.TYPEORM_HOST,
  port: process.env.TYPEORM_PORT,
  user: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
});

// Fix statistic count for order
connection.connect(async (err) => {
  if (err) {
    console.log(err);
    return;
  }
  const query = util.promisify(connection.query).bind(connection);

  const startOfRecentDate = moment().utc().subtract(29, 'day').startOf('day').format('YYYY-MM-DD hh:mm:ss');
  const endOfRecentDate = moment().utc().endOf('day').format('YYYY-MM-DD hh:mm:ss');
  const endOfDay = moment().utc().endOf('day').subtract(1, 'day').toISOString();
  const querySumStatistic = `
  COUNT(*) AS totalOrderCount,
  SUM(CASE WHEN orders.status = 4 THEN 1 ELSE 0 END)  AS orderCompletedCount,
   SUM(CASE WHEN orders.completed_time BETWEEN '${startOfRecentDate}' AND '${endOfRecentDate}' THEN 1 ELSE 0 END)  AS monthOrderCount,
   SUM(
       CASE WHEN (orders.completed_time BETWEEN '${startOfRecentDate}' AND '${endOfRecentDate}') AND
       orders.status = 4
       THEN 1 ELSE 0 END
   )  AS monthOrderCompletedCount,
   SUM(CASE WHEN orders.status = 5 THEN 1 ELSE 0 END)  AS cancelOrderCount,
   SUM(CASE WHEN orders.type = 'BUY' THEN 1 ELSE 0 END) AS totalBuyOrderCount,
   SUM(CASE WHEN orders.type = 'SELL' THEN 1 ELSE 0 END) AS totalSellOrderCount,
   SUM(CASE WHEN orders.status = 4 THEN orders.total_price ELSE 0 END) AS totalAmountCount,
   SUM(CASE WHEN orders.status = 4 THEN orders.total_fee ELSE 0 END) AS totalFeeCount,
   SUM(orders.total_penalty_fee) AS totalPenaltyFeeCount
  FROM orders
  LEFT JOIN appeals ON orders.appeal_id = appeals.id
  WHERE (orders.status = 4 OR (orders.status = 5 AND orders.appeal_id IS NOT NULL AND appeals.decision_result != 5)) AND orders.completed_time < '${endOfDay}'
  `;
  const queryUpdateStatistic = (data) => `
  SET total_order_count = ${Number(data.totalOrderCount)},
      order_completed_count = ${Number(data.orderCompletedCount)},
      month_order_count = ${Number(data.monthOrderCount)},
      month_order_completed_count = ${Number(data.monthOrderCompletedCount)},
      cancel_order_count = ${Number(data.cancelOrderCount)},
      total_buy_order_count = ${Number(data.totalBuyOrderCount)},
      total_sell_order_count = ${Number(data.totalSellOrderCount)},
      total_amount_count = ${Number(data.totalAmountCount)},
      total_fee_count = ${Number(data.totalFeeCount)},
      total_penalty_fee_count = ${Number(data.totalPenaltyFeeCount)},
      last_count_at = '${moment().utc().format('YYYY-MM-DD hh:mm:ss.SSSSSS')}'
  `;
  const userSumStatistics = await query(
    `SELECT
       user_id,
       ${querySumStatistic}
       group by user_id`
  );
  await Promise.all(
    userSumStatistics.map((data) => {
      return query(`
          UPDATE statistics
          ${queryUpdateStatistic(data)}
          WHERE statistics.user_id = '${data.user_id}';
        `);
    })
  );

  const operatorSumStatistic = await query(
    `SELECT
       merchant_id,
       ${querySumStatistic}
       group by merchant_id`
  );
  await Promise.all(
    operatorSumStatistic.map((data) => {
      return query(`
          UPDATE statistics
          ${queryUpdateStatistic(data)}
          WHERE statistics.operation_id = '${data.merchant_id}';
        `);
    })
  );
  process.exit(0);
});

// Fix statistic count for appeal
const BUY_ORDER_STEPS = {
  BUY_ORDER_CREATED_BY_USER: 1,
  BUY_ORDER_CREATED_BY_USER_DEAL_TIME: 2,
  BUY_NOTIFY_SENT_FIAT_BY_USER: 3,
  BUY_NOTIFY_SENT_FIAT_BY_USER_DEAL_TIME: 4,
  BUY_ENABLE_APPEAL_WHILE_CONFIRMING_FIAT_BY_MERCHANT: 5,
  BUY_APPEAL_SENT_WHILE_CONFIRMING_FIAT_BY_MERCHANT: 6,
  BUY_CONFIRMED_FIAT_BY_MERCHANT: 7,
  BUY_CONFIRMED_FIAT_BY_MERCHANT_DEAL_TIME: 8,
  BUY_SENDING_CRYPTO_BY_MERCHANT: 9,
  BUY_SENDING_CRYPTO_FAILED: 10,
  BUY_APPEAL_SENT_SENDING_CRYPTO_FAILED: 11,
  BUY_SENDING_CRYPTO_SUCCESS: 12,
  BUY_ORDER_CANCELLED_BY_USER: 13,
  BUY_ORDER_CANCELLED_BY_SYSTEM: 14,
};

const SELL_ORDER_STEP = {
  SELL_ORDER_CREATED_BY_USER: 1,
  SELL_SENDING_CRYPTO_BY_USER: 2,
  SELL_SENDING_CRYPTO_FAILED: 3,
  SELL_SENDING_CRYPTO_SUCCESS: 4,
  SELL_SENDING_CRYPTO_SUCCESS_DEAL_TIME: 5,
  SELL_NOTIFY_SENT_FIAT_BY_MERCHANT_DEAL_TIME: 6,
  SELL_ENABLE_APPEAL_NOTIFY_SENT_FIAT_BY_MERCHANT: 7,
  SELL_APPEAL_SENT_FIAT_NOT_RECEIVED_BY_USER: 8,
  SELL_CONFIRMED_FIAT_BY_USER: 9,
  SELL_ORDER_CANCELLED_BY_USER: 10,
  SELL_ORDER_CANCELLED_BY_SYSTEM: 11,
};

const ORDER_STATUS = {
  TO_BE_PAID: 1,
  CONFIRM_PAID: 2,
  PAID: 3,
};

const GROUP_STATISTIC_MAPPING = {
  WAITING: 'orderWaitingCount',
  WAITING_USER: 'orderWaitingUserCount',
  APPEAL: 'orderAppealCount',
};

const BUY_ORDER_GROUPS = {
  WAITING: [
    BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER,
    BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER_DEAL_TIME,
    BUY_ORDER_STEPS.BUY_ENABLE_APPEAL_WHILE_CONFIRMING_FIAT_BY_MERCHANT,
    BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT,
    BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT_DEAL_TIME,
    BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_BY_MERCHANT,
    BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_FAILED,
  ],
  WAITING_USER: [BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER, BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER_DEAL_TIME],
  APPEAL: [
    BUY_ORDER_STEPS.BUY_APPEAL_SENT_WHILE_CONFIRMING_FIAT_BY_MERCHANT,
    BUY_ORDER_STEPS.BUY_APPEAL_SENT_SENDING_CRYPTO_FAILED,
    BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER_DEAL_TIME,
  ],
};

const SELL_ORDER_GROUPS = {
  WAITING: [SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS, SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS_DEAL_TIME],
  WAITING_USER: [
    SELL_ORDER_STEP.SELL_ORDER_CREATED_BY_USER,
    SELL_ORDER_STEP.SELL_SENDING_CRYPTO_BY_USER,
    SELL_ORDER_STEP.SELL_SENDING_CRYPTO_FAILED,
    SELL_ORDER_STEP.SELL_NOTIFY_SENT_FIAT_BY_MERCHANT_DEAL_TIME,
    SELL_ORDER_STEP.SELL_ENABLE_APPEAL_NOTIFY_SENT_FIAT_BY_MERCHANT,
  ],
  APPEAL: [
    SELL_ORDER_STEP.SELL_APPEAL_SENT_FIAT_NOT_RECEIVED_BY_USER,
    SELL_ORDER_STEP.SELL_NOTIFY_SENT_FIAT_BY_MERCHANT_DEAL_TIME,
  ],
};

connection.connect(async (err) => {
  if (err) {
    console.log(err);
    return;
  }

  const query = util.promisify(connection.query).bind(connection);
  await query(`UPDATE statistics
  SET order_waiting_count = 0,
  order_waiting_user_count = 0,
  order_appeal_count = 0
  WHERE operation_id IS NOT NULL;`);
  const statisticQuery = `
  SELECT od.merchant_id as merchantId,
  SUM(CASE WHEN (od.type = 'SELL' AND od.step IN (?)) OR (od.type = 'BUY' AND od.step IN (?)) THEN 1 ELSE 0 END) as orderWaitingCount,
  SUM(CASE WHEN (od.type = 'SELL' AND od.step IN (?)) OR (od.type = 'BUY' AND od.step IN (?)) THEN 1 ELSE 0 END) as orderWaitingUserCount,
  SUM(CASE WHEN (od.type = 'SELL' AND od.step IN (?)) OR (od.type = 'BUY' AND od.step IN (?)) THEN 1 ELSE 0 END) as orderAppealCount
  FROM orders od
  WHERE od.status IN (?)
  GROUP BY od.merchant_id
  `;
  const statisticResult = await query(statisticQuery, [
    SELL_ORDER_GROUPS.WAITING,
    BUY_ORDER_GROUPS.WAITING,
    SELL_ORDER_GROUPS.WAITING_USER,
    BUY_ORDER_GROUPS.WAITING_USER,
    SELL_ORDER_GROUPS.APPEAL,
    BUY_ORDER_GROUPS.APPEAL,
    [ORDER_STATUS.TO_BE_PAID, ORDER_STATUS.CONFIRM_PAID, ORDER_STATUS.PAID],
  ]);
  if (statisticResult?.length === 0) {
    process.exit(0);
  }
  const updateStatisticQueries = [];
  statisticResult.map((e) => {
    const updateStatisticQuery = `UPDATE statistics
    SET order_waiting_count = ${e.orderWaitingCount}, 
    order_waiting_user_count = ${e.orderWaitingUserCount}, 
    order_appeal_count = ${e.orderAppealCount} 
    WHERE operation_id = '${e.merchantId}';`;
    updateStatisticQueries.push(updateStatisticQuery);
  });
  await Promise.all(updateStatisticQueries.map((e) => query(e)));
  process.exit(0);
});
