const db = require("../db");

const doclist = async (req, res) => {
	try {
		const [rows] = await db.query(`
      SELECT 
        d.user_id,
        d.name,
        l.email,
        d.specialization,
        d.phone_no,
        d.dob,
        d.gender
      FROM doctor d
      JOIN login l ON d.user_id = l.user_id
      WHERE l.role = 'doctor' and l.is_active = 'active'
      ORDER BY d.user_id ASC
    `);

		return res.status(200).json(rows);
	} catch (err) {
		console.error("Error loading doctor list:", err.message);
		console.error("Error code:", err.code);

		return res.status(500).json({
			message: "Failed to load doctor list",
		});
	}
};

module.exports = { doclist };
