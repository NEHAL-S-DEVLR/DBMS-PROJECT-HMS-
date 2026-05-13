require("dotenv").config();

const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

(async () => {
    try {
        const connection = await db.getConnection();

        console.log("Connected to Railway MySQL ✅");

        connection.release();
    } catch (error) {
        console.error("DB connection failed:");
        console.error(error.message);
    }
})();

module.exports = db;
