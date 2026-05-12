const db = require("../db");

const docupdatestatus = async (req, res) => {
    try {
        const { appointment_id, status } = req.body;

        if (!appointment_id || !status) {
            return res.status(400).json({
                message: "Appointment ID and status are required",
            });
        }

        if (!["pending", "confirmed", "declined", "completed"].includes(status)) {
            return res.status(400).json({
                message: "Invalid status value",
            });
        }

        const [result] = await db.query(
            `
            UPDATE appointment
            SET request = ?
            WHERE appointment_id = ?
            `,
            [status, appointment_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Appointment not found",
            });
        }

        return res.status(200).json({
            message: "Appointment status updated successfully",
        });
    } catch (error) {
        console.error("docupdatestatus error:", error);

        return res.status(500).json({
            message: "Failed to update appointment status",
            error: error.message,
        });
    }
};

module.exports = { docupdatestatus };
