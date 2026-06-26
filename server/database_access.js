const mysql=require('mysql2');

const connectionPool=mysql.createPool({
    host : 'thomas.proxy.rlwy.net',
    user : 'root',
    port : 27229,
    password : 'QvTPqHlpxiXevdKtAlYrzTLDxGfzJFbj',
    database : 'railway',
    connectionLimit : 10,
    waitForConnections : true,
    queueLimit : 0
}).promise();

module.exports={connectionPool};