const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "rvupnm@12345",
    database: process.env.DB_NAME || "project",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

(async () => {
    try {
        const connection = await db.getConnection();

        console.log("Connected to MySQL ✅");

        connection.release();
    } catch (error) {
        console.error("DB connection failed:");
        console.error(error.message);
    }
})();

module.exports = db;
