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

    console.log('Averaging order time is calculating...');
    const rawQuery = `SELECT AVG(TIMESTAMPDIFF(SECOND, od.created_time, od.completed_time)) as avg_order_time,
    CASE WHEN od.status = 4 THEN 'COMPLETED' WHEN od.status = 5 AND od.appeal_id IS NOT NULL AND al.decision_result != 5 THEN 'CANCELLED' ELSE 'INVALID' END as state, od.merchant_id as merchant_id
    FROM orders od
    LEFT JOIN appeals al ON od.appeal_id = al.id
    WHERE (od.status = 4 OR (od.status = 5 AND od.appeal_id IS NOT NULL AND al.decision_result != 5)) 
    GROUP BY merchant_id, state`;
    const avgOrderTime = (await query(rawQuery))
    if (!avgOrderTime?.length) {    
        console.log('No data found');
        process.exit(0);
    }
    const obj = {};
    console.log('Averaging order time is calculated');
    avgOrderTime.forEach(e => {
        if (!obj[e.merchant_id]) {
            obj[e.merchant_id] = {};
        }
        obj[e.merchant_id][e.state] = e.avg_order_time;
    });
    const updateQuery = Object.keys(obj).map(e => {
        return query(`UPDATE statistics SET average_completed_time = ${obj[e]['COMPLETED'] || 0}, average_cancelled_time = ${obj[e]['CANCELLED'] || 0} WHERE operation_id = '${e}'`);
    });
    await Promise.all(updateQuery);
    console.log('Averaging order time is updated');
  process.exit(0);
})
