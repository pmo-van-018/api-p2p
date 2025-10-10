const mysql = require('mysql2');
const dotenv = require('dotenv');
const util = require('util');
const moment = require('moment');
const find = require('lodash/find');
const uuid = require('uuid');
const CronJob = require('cron').CronJob;

dotenv.config();

const kafkaVersion = process.env.KAFKA_ORDER_EVENT_VERSION || '1.0.0';
const kafkaTopic = process.env.KAFKA_ORDER_TOPIC || 'orders-v1';

const connection = mysql.createConnection({
  host: process.env.TYPEORM_HOST,
  port: process.env.TYPEORM_PORT,
  user: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
});

const CONTENT_TYPE_BANK = {
  BANK_HOLDER: 'payee',
  BANK_NUMBER: 'pay_account',
  BANK_NAME: 'bank',
  BANK_REMARK: 'note',
};

const getPaymentMethodField = (fields, type) => {
  if (!fields.length) {
    return '';
  }

  const paymentMethodFieldFound = find(fields, ['content_type', type]);
  return paymentMethodFieldFound ? paymentMethodFieldFound.value : '';
};

const cronTime = process.env.CRON_BACKFILL_ORDERS_TO_OUT_BOX || '*/1 * * * *';

const job = new CronJob(
  cronTime, // cronTime
  function () {
    connection.connect(async (err) => {
      if (err) {
        console.log(err);
        return;
      }

      try {
        const query = util.promisify(connection.query).bind(connection);

        console.log('Backfilling orders to outbox...');

        const backfillOrders = await query(
          `
        SELECT 
            JSON_OBJECT(
                'id', o.id,
                'ref_id', o.ref_id,
                'created_at', o.created_at,
                'updated_at', o.updated_at,
                'deleted_at', o.deleted_at,
                'user_id', o.user_id,
                'merchant_id', o.merchant_id,
                'supporter_id', o.supporter_id,
                'asset_id', o.asset_id,
                'fiat_id', o.fiat_id,
                'post_id', o.post_id,
                'amount', o.amount,
                'total_price', o.total_price,
                'request_amount', o.request_amount,
                'request_total_price', o.request_total_price,
                'price', o.price,
                'status', o.status,
                'step', o.step,
                'appeal_id', o.appeal_id,
                'type', o.type,
                'created_time', o.created_time,
                'completed_time', o.completed_time,
                'ended_time', o.ended_time,
                'payment_method_id', o.payment_method_id,
                'fee', o.fee,
                'penalty_fee', o.penalty_fee,
                'cancel_by_operation_id', o.cancel_by_operation_id,
                'cancel_by_user_id', o.cancel_by_user_id,
                'confirm_hash_by_supporter_id', o.confirm_hash_by_supporter_id,
                'trans_code', o.trans_code,
                'total_fee', o.total_fee,
                'total_penalty_fee', o.total_penalty_fee,
                'appeal_resolved', o.appeal_resolved,
                'room_id', o.room_id,
                'configuration', o.configuration,
                'benchmark_price', o.benchmark_price,
                'benchmark_percent', o.benchmark_percent,
                'benchmark_price_at_created', o.benchmark_price_at_created,
                'benchmark_price_at_sent', o.benchmark_price_at_sent,
                'is_payment_from_another_account', o.is_payment_from_another_account,
                'payment_info', o.payment_info,
                'user', 
                JSON_OBJECT(
                    'id', u.id,
                    'created_at', u.created_at,
                    'updated_at', u.updated_at,
                    'deleted_at', u.deleted_at,
                    'wallet_address', u.wallet_address,
                    'type', u.type,
                    'nick_name', u.nick_name,
                    'statistic_id', u.statistic_id,
                    'lock_end_time', u.lock_end_time,
                    'skip_note_at', u.skip_note_at,
                    'activated_at', u.activated_at,
                    'last_login_at', u.last_login_at,
                    'status', u.status,
                    'peer_chat_id', u.peer_chat_id,
                    'allow_notification', u.allow_notification,
                    'referral_code', u.referral_code,
                    'is_referred', u.is_referred,
                    'avatar', u.avatar
                ),
                'post', 
                JSON_OBJECT(
                    'id', p.id,
                    'created_at', p.created_at,
                    'updated_at', p.updated_at,
                    'deleted_at', p.deleted_at,
                    'merchant_id', p.merchant_id,
                    'ref_id', p.ref_id,
                    'asset_id', p.asset_id,
                    'fiat_id', p.fiat_id,
                    'payment_method_id', p.payment_method_id,
                    'status', p.status,
                    'available_amount', p.available_amount,
                    'total_amount', p.total_amount,
                    'finished_amount', p.finished_amount,
                    'block_amount', p.block_amount,
                    'max_order_amount', p.max_order_amount,
                    'min_order_amount', p.min_order_amount,
                    'payment_time_limit', p.payment_time_limit,
                    'price', p.price,
                    'total_fee', p.total_fee,
                    'total_penalty_fee', p.total_penalty_fee,
                    'real_price', p.real_price,
                    'type', p.type,
                    'note', p.note,
                    'is_show', p.is_show,
                    'updated_by', p.updated_by,
                    'created_by', p.created_by,
                    'benchmark_price', p.benchmark_price,
                    'benchmark_percent', p.benchmark_percent
                ),
                'asset', 
                JSON_OBJECT(
                    'id', a.id,
                    'created_at', a.created_at,
                    'updated_at', a.updated_at,
                    'deleted_at', a.deleted_at,
                    'symbol', a.symbol,
                    'name', a.name,
                    'network', a.network,
                    'logo', a.logo,
                    'precision', a.precision,
                    'contract', a.contract,
                    'order_number', a.order_number
                ),
                'merchant', 
                JSON_OBJECT(
                    'id', m.id,
                    'created_at', m.created_at,
                    'updated_at', m.updated_at,
                    'deleted_at', m.deleted_at,
                    'wallet_address', m.wallet_address,
                    'type', m.type,
                    'merchant_level', m.merchant_level,
                    'merchant_manager_id', m.merchant_manager_id,
                    'contract_from', m.contract_from,
                    'contract_to', m.contract_to,
                    'nick_name', m.nick_name,
                    'statistic_id', m.statistic_id,
                    'lock_end_time', m.lock_end_time,
                    'skip_note_at', m.skip_note_at,
                    'activated_at', m.activated_at,
                    'last_login_at', m.last_login_at,
                    'status', m.status,
                    'peer_chat_id', m.peer_chat_id,
                    'ref_id', m.ref_id,
                    'avatar', m.avatar,
                    'allow_notification', m.allow_notification,
                    'updated_by', m.updated_by,
                    'created_by', m.created_by,
                    'allow_gasless', m.allow_gasless,
                    'gasles_trans_limit', m.gasles_trans_limit
                ),
                'crypto_transactions', 
                (
                    SELECT 
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', ct.id,
                                'created_at', ct.created_at,
                                'updated_at', ct.updated_at,
                                'deleted_at', ct.deleted_at,
                                'order_id', ct.order_id,
                                'hash', ct.hash,
                                'network', ct.network,
                                'status', ct.status,
                                'fail_code', ct.fail_code
                            )
                        )
                    FROM 
                        crypto_transactions ct 
                    WHERE 
                        ct.order_id = o.id AND ct.deleted_at IS NULL
                ),
                'payment_method', 
                JSON_OBJECT(
                    'id', pm.id,
                    'created_at', pm.created_at,
                    'updated_at', pm.updated_at,
                    'deleted_at', pm.deleted_at,
                    'user_id', pm.user_id,
                    'operation_id', pm.operation_id,
                    'type', pm.type,
                    'method_name', pm.method_name,
                    'method_short_name', pm.method_short_name
                ),
                'payment_method_fields', 
                (
                    SELECT 
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', pmf.id,
                                'created_at', pmf.created_at,
                                'updated_at', pmf.updated_at,
                                'deleted_at', pmf.deleted_at,
                                'content_type', pmf.content_type,
                                'name', pmf.name,
                                'value', pmf.value,
                                'payment_method_id', pmf.payment_method_id
                            )
                        )
                    FROM 
                        payment_method_fields pmf 
                    WHERE 
                        pmf.payment_method_id = pm.id AND pmf.deleted_at IS NULL
                ),
                'payment_tickets', 
                (
                    SELECT 
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', pt.id,
                                'order_id', pt.order_id,
                                'note', pt.note,
                                'receiver', pt.receiver,
                                'bank_no', pt.bank_no,
                                'gateway', pt.gateway,
                                'payment_method_id', pt.payment_method_id,
                                'amount', pt.amount,
                                'type', pt.type,
                                'status', pt.status,
                                'credit_draw_by', pt.credit_draw_by,
                                'credit_draw_at', pt.credit_draw_at,
                                'cancelled_at', pt.cancelled_at,
                                'picked_at', pt.picked_at,
                                'created_at', pt.created_at,
                                'updated_at', pt.updated_at,
                                'payload_log', pt.payload_log
                            )
                        )
                    FROM 
                        payment_tickets pt 
                    WHERE 
                        pt.order_id = o.id
                )
            ) AS item
        FROM 
            orders o
        LEFT JOIN 
            users u ON u.id = o.user_id AND u.deleted_at IS NULL
        LEFT JOIN 
            posts p ON p.id = o.post_id AND p.deleted_at IS NULL
        LEFT JOIN 
            assets a ON a.id = o.asset_id AND a.deleted_at IS NULL
        LEFT JOIN 
            operations m ON m.id = o.merchant_id AND m.deleted_at IS NULL
        LEFT JOIN 
            payment_methods pm ON pm.id = o.payment_method_id AND pm.deleted_at IS NULL
        WHERE 
            o.status = 4 
            AND NOT EXISTS (
                SELECT 1 
                FROM outbox ob 
                WHERE ob.aggregate_id = o.ref_id
            )
            AND DATE(o.completed_time) = CURRENT_DATE()
            AND o.deleted_at IS NULL
        ORDER BY 
            o.created_at ASC
    `
        );

        if (!backfillOrders.length) {
          console.log('No orders to backfill');
          return;
        }

        const params = backfillOrders
          .map((row) => {
            const { item } = row;
            const event = {
              version: kafkaVersion,
              orderId: item.ref_id,
              senderAddress: item.user.wallet_address,
              senderName: item.merchant.nick_name,
              addressReceive: item.merchant.wallet_address,
            };

            if (item?.crypto_transactions) {
              event.transactionId = item?.crypto_transactions?.find((tx) => tx?.status === 2)?.hash ?? '';
            }

            event.amountCrypto = item?.amount;
            event.rate = item?.price;
            event.network = item?.asset?.network;
            event.amountVND = item?.total_price;
            event.accountIdReceiveCrypto = item?.merchant?.wallet_address ?? '';
            event.accountIdSendVND = item?.merchant.ref_id ?? '';

            event.bankNumber = getPaymentMethodField(item?.payment_method_fields, CONTENT_TYPE_BANK.BANK_NUMBER) ?? '';
            event.bankName = getPaymentMethodField(item?.payment_method_fields, CONTENT_TYPE_BANK.BANK_NAME) ?? '';
            event.bankHolder = getPaymentMethodField(item?.payment_method_fields, CONTENT_TYPE_BANK.BANK_HOLDER) ?? '';

            event.createdAt = moment(item.created_at).valueOf();
            event.updatedAt = moment(item?.updated_at).valueOf();
            event.note = item?.post?.note;
            event.processBy = item?.merchant?.nick_name;

            event.bocData = item?.payment_tickets?.[0]?.payload_log
              ? JSON.parse(item?.payment_tickets?.[0]?.payload_log)
              : null;

            event.orderType = item?.type;

            return event;
          })
          // Map to payload
          .map((event) => ({
            id: uuid.v4(),
            topic: kafkaTopic,
            eventType: 'ORDER_COMPLETED',
            aggregateId: event.orderId,
            payload: JSON.stringify(event),
          }))
          // Construct insert params
          .map((event) => [event.id, event.topic, event.eventType, event.aggregateId, event.payload]);

        if (!params.length) {
          console.log('No orders to backfill');
          return;
        }

        // Insert into outbox on duplicate ignore raw query
        const insertQuery = 'INSERT IGNORE INTO outbox (id, topic, event_type, aggregate_id, payload) VALUES ?';

        const insertedResults = await query(insertQuery, [params]);

        console.log(`Backfilled ${insertedResults?.affectedRows} orders to outbox`);
      } catch (err) {
        console.error(err);
      }
    });
  }, // onTick
  null // onComplete
);

job.start();
