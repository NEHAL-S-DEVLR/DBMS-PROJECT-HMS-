const db = require("../db");

const loadMessages = async (req, res) => {
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

        const [apptRows] = await db.query(
            `SELECT appointment_id, doctor_id, patient_id
             FROM appointment
             WHERE appointment_id = ?`,
            [appointment_id]
        );

        if (apptRows.length === 0) {
            return res.status(404).json({
                message: "Appointment not found",
            });
        }

        const appointment = apptRows[0];

        const isDoctorForAppointment =
            sessionRole === "doctor" &&
            Number(sessionUserId) === Number(appointment.doctor_id);

        const isPatientForAppointment =
            sessionRole === "patient" &&
            Number(sessionUserId) === Number(appointment.patient_id);

        if (!isDoctorForAppointment && !isPatientForAppointment) {
            return res.status(403).json({
                message: "You are not allowed to view messages for this appointment",
            });
        }

        const [msgRows] = await db.query(
            `SELECT
                m.message_id,
                m.appointment_id,
                m.sender_user_id,
                m.sender_role,
                m.message_text,
                m.sent_at,
                CASE
                    WHEN m.sender_role = 'doctor' THEN d.name
                    WHEN m.sender_role = 'patient' THEN p.name
                    ELSE 'Unknown'
                END AS sender_display_name
             FROM appointment_messages m
             JOIN appointment a ON a.appointment_id = m.appointment_id
             LEFT JOIN doctor d ON d.user_id = a.doctor_id
             LEFT JOIN patient p ON p.user_id = a.patient_id
             WHERE m.appointment_id = ?
               AND m.is_deleted = 0
             ORDER BY m.sent_at ASC, m.message_id ASC`,
            [appointment_id]
        );

        return res.status(200).json(msgRows);
    } catch (err) {
        console.error("loadMessages error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err.message,
        });
    }
};

module.exports = { loadMessages };