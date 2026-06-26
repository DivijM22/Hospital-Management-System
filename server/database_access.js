const mysql=require('mysql2');
const fs=require('fs');

const connectionPool=mysql.createPool({
    host : 'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',
    user : '2HrpwzQ11ZtDnbt.root',
    port : 4000,
    password : 'WMnIDoMTPjL34u1j',
    database : 'test',
    connectionLimit : 10,
    ssl: {
        ca: fs.readFileSync("/mnt/c/Users/Divij/Downloads/isrgrootx1.pem"),
    }, 
    waitForConnections : true,
    queueLimit : 0
}).promise();

module.exports={connectionPool};