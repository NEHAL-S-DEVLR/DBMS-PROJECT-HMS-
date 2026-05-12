const db = require("../db");

const deleteChat = async (req, res) => {
    try {
        const { appointment_id } = req.query;

        const sessionUserId = req.session?.user?.id;
        const sessionRole = req.session?.user?.role;

        if (!appointment_id) {
            return res.status(400).json({
                message: "appointment_id is required",
            });
        }

        if (!sessionUserId || !sessionRole) {
            return res.status(401).json({
                message: "Not authenticated",
            });
        }

        const [appointmentRows] = await db.query(
            `SELECT appointment_id, doctor_id, patient_id
             FROM appointment
             WHERE appointment_id = ?`,
            [appointment_id]
        );

        if (appointmentRows.length === 0) {
            return res.status(404).json({
                message: "Appointment not found",
            });
        }

        const appointment = appointmentRows[0];

        const isDoctor =
            sessionRole === "doctor" &&
            Number(sessionUserId) === Number(appointment.doctor_id);

        const isPatient =
            sessionRole === "patient" &&
            Number(sessionUserId) === Number(appointment.patient_id);

        if (!isDoctor && !isPatient) {
            return res.status(403).json({
                message: "You are not allowed to delete this chat",
            });
        }

        const [result] = await db.query(
            `DELETE FROM appointment_messages
             WHERE appointment_id = ?`,
            [appointment_id]
        );

        return res.status(200).json({
            message: "All messages deleted successfully",
            deletedRows: result.affectedRows,
        });
    } catch (err) {
        console.error("deleteChat error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err.message,
        });
    }
};

module.exports = { deleteChat };