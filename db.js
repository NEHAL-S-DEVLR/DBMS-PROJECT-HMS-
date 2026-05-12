const mysql = require("mysql2/promise");

const db = mysql.createPool({
	host: "127.0.0.1",
	port: 3306,
	user: "root",
	password: "rvupnm@12345",
	database: "project",
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

(async () => {
	try {
		const conn = await db.getConnection();
		console.log("Connected to MySQL ✅");
		conn.release();
	} catch (err) {
		console.error("DB connection failed:");
		console.error(err.message);
	}
})();

module.exports = db;