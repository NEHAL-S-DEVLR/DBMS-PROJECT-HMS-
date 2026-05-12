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
                message: "User not logged in",
            });
        }

        const [appointments] = await db.query(
            `
            SELECT appointment_id, doctor_id, patient_id
            FROM appointment
            WHERE appointment_id = ?
            `,
            [appointment_id]
        );

        if (appointments.length === 0) {
            return res.status(404).json({
                message: "Appointment not found",
            });
        }

        const appointment = appointments[0];

        const isValidDoctor =
            sessionRole === "doctor" &&
            Number(sessionUserId) === Number(appointment.doctor_id);

        const isValidPatient =
            sessionRole === "patient" &&
            Number(sessionUserId) === Number(appointment.patient_id);

        if (!isValidDoctor && !isValidPatient) {
            return res.status(403).json({
                message: "You are not allowed to delete this chat",
            });
        }

        await db.query(
            `
            UPDATE appointment_messages
            SET is_deleted = 1
            WHERE appointment_id = ?
            `,
            [appointment_id]
        );

        return res.status(200).json({
            message: "Chat deleted successfully",
        });
    } catch (error) {
        console.error("deleteChat error:", error);

        return res.status(500).json({
            message: "Failed to delete chat",
            error: error.message,
        });
    }
};

module.exports = { deleteChat };
