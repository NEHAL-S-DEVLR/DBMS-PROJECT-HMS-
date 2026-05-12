const db = require("../db");

const sendmessage = async (req, res) => {
	console.log("BODY:", req.body);
	console.log("SESSION:", req.session);
	console.log("session user id:", req.session?.user?.id);
	console.log("session role:", req.session?.user?.role);
	try {
		const { appointment_id, message_text } = req.body;

		const sessionUserId = req.session?.user?.id;
		const sessionRole = req.session?.user?.role;

		if (!sessionUserId || !sessionRole) {
			return res.status(401).json({
				message: "User not logged in",
			});
		}

		if (sessionRole !== "doctor" && sessionRole !== "patient") {
			return res.status(403).json({
				message: "Only doctor or patient can send messages",
			});
		}

		if (!appointment_id || !message_text || !message_text.trim()) {
			return res.status(400).json({
				message: "appointment_id and message_text are required",
			});
		}

		const [appointmentRows] = await db.query(
			`SELECT appointment_id, doctor_id, patient_id
             FROM appointment
             WHERE appointment_id = ?`,
			[appointment_id],
		);

		if (appointmentRows.length === 0) {
			return res.status(404).json({
				message: "Appointment not found",
			});
		}

		const appointment = appointmentRows[0];

		const isValidDoctor =
			sessionRole === "doctor" &&
			Number(sessionUserId) === Number(appointment.doctor_id);

		const isValidPatient =
			sessionRole === "patient" &&
			Number(sessionUserId) === Number(appointment.patient_id);

		if (!isValidDoctor && !isValidPatient) {
			return res.status(403).json({
				message:
					"You are not allowed to send messages for this appointment",
			});
		}

		const [result] = await db.query(
			`INSERT INTO appointment_messages
             (appointment_id, sender_user_id, sender_role, message_text)
             VALUES (?, ?, ?, ?)`,
			[appointment_id, sessionUserId, sessionRole, message_text.trim()],
		);

		return res.status(201).json({
			message: "Message sent successfully",
			message_id: result.insertId,
		});
	} catch (err) {
		console.error("sendmessage error:", err);
		return res.status(500).json({
			message: "Server error",
			error: err.message,
		});
	}
};

module.exports = { sendmessage };
