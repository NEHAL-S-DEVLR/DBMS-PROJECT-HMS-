const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        rejectUnauthorized: false,
    },

    connectTimeout: 20000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

(async () => {
    try {
        const connection = await db.getConnection();

        console.log("Connected to Aiven MySQL ✅");

        connection.release();
    } catch (error) {
        console.error("DB connection failed:");
        console.error("Code:", error.code);
        console.error("Message:", error.message);
    }
})();

module.exports = db;