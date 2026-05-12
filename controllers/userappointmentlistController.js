const db = require("../db");

const userappointmentlist = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        const userRole = req.session.user?.role;

        if (!userId) {
            return res.status(401).json({
                message: "User not logged in",
            });
        }

        let rows;

        if (userRole === "doctor") {
            [rows] = await db.query(
                `SELECT
                    a.appointment_id,
                    p.name AS patient_name,
                    d.name AS doctor_name,
                    d.specialization,
                    a.appointment_date,
                    a.appointment_time,
                    a.reason,
                    a.request AS request_status
                FROM appointment a
                JOIN patient p ON a.patient_id = p.user_id
                JOIN doctor d ON a.doctor_id = d.user_id
                WHERE a.doctor_id = ? AND a.request IN ('confirmed', 'completed')
                ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
                [userId]
            );
        } else if (userRole === "patient") {
            [rows] = await db.query(
                `SELECT
                    a.appointment_id,
                    p.name AS patient_name,
                    d.name AS doctor_name,
                    d.specialization,
                    a.appointment_date,
                    a.appointment_time,
                    a.reason,
                    a.request AS request_status
                FROM appointment a
                JOIN patient p ON a.patient_id = p.user_id
                JOIN doctor d ON a.doctor_id = d.user_id
                WHERE a.patient_id = ?
                ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
                [userId]
            );
        } else {
            return res.status(403).json({
                message: "Invalid user role",
            });
        }

        return res.status(200).json(rows);
    } catch (err) {
        console.error("Error loading user appointment list:", err.message);
        console.error("Error code:", err.code);

        return res.status(500).json({
            message: "Failed to load user appointment list",
        });
    }
};

module.exports = { userappointmentlist };