const mysql=require('mysql2');
const fs=require('fs');

const connectionPool=mysql.createPool({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    port : process.env.DB_PORT,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
    connectionLimit : 10,
    ssl: {
        ca: fs.readFileSync("isrgrootx1.pem"),
    }, 
    waitForConnections : true,
    queueLimit : 0
}).promise();

module.exports={connectionPool};