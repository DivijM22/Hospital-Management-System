const mysql=require('mysql2');

const connectionPool=mysql.createPool({
    host : 'localhost',
    user : 'root',
    password : 'divijm69',
    database : 'hospital_db',
    connectionLimit : 10,
    waitForConnections : true,
    queueLimit : 0
}).promise();

module.exports={connectionPool};