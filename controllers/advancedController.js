const db = require("../db");

function getUserId(req) {
    return req.session?.user?.id || req.session?.user?.user_id || req.session?.userId;
}

function getUserRole(req) {
    return req.session?.user?.role;
}

function requireRole(req, res, allowedRoles) {
    const role = getUserRole(req);

    if (!role || !allowedRoles.includes(role)) {
        res.status(403).json({
            message: "You are not allowed to perform this action",
        });

        return false;
    }

    return true;
}

const allEMR = async (req, res) => {
    try {
        const [rows] = await db.query(
            `
            SELECT
                e.emr_id,
                e.appointment_id,
                e.patient_id,
                p.name AS patient_name,
                e.doctor_id,
                d.name AS doctor_name,
                e.diagnosis,
                e.vitals,
                e.allergies,
                e.clinical_notes,
                e.created_at
            FROM emr e
            JOIN patient p ON e.patient_id = p.user_id
            JOIN doctor d ON e.doctor_id = d.user_id
            ORDER BY e.emr_id DESC
            `
        );

        return res.status(200).json(rows);
    } catch (error) {
        console.error("allEMR error:", error);

        return res.status(500).json({
            message: "Failed to load EMR records",
            error: error.message,
        });
    }
};

const createEMR = async (req, res) => {
    try {
        if (!requireRole(req, res, ["doctor"])) {
            return;
        }

        const doctorId = getUserId(req);
        const { appointment_id, diagnosis, vitals, allergies, clinical_notes } = req.body;

        if (!appointment_id || !diagnosis || !vitals) {
            return res.status(400).json({
                message: "Appointment ID, diagnosis and vitals are required",
            });
        }

        const [appointments] = await db.query(
            `
            SELECT appointment_id, patient_id, doctor_id
            FROM appointment
            WHERE appointment_id = ?
            AND doctor_id = ?
            `,
            [appointment_id, doctorId]
        );

        if (appointments.length === 0) {
            return res.status(404).json({
                message: "Appointment not found for this doctor",
            });
        }

        const appointment = appointments[0];

        const [existing] = await db.query(
            "SELECT emr_id FROM emr WHERE appointment_id = ?",
            [appointment_id]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "EMR already exists for this appointment",
            });
        }

        const [result] = await db.query(
            `
            INSERT INTO emr
                (appointment_id, patient_id, doctor_id, diagnosis, vitals, allergies, clinical_notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                appointment.appointment_id,
                appointment.patient_id,
                appointment.doctor_id,
                diagnosis,
                vitals,
                allergies || "",
                clinical_notes || "",
            ]
        );

        return res.status(201).json({
            message: "EMR created successfully",
            emr_id: result.insertId,
        });
    } catch (error) {
        console.error("createEMR error:", error);

        return res.status(500).json({
            message: "Failed to create EMR",
            error: error.message,
        });
    }
};

const allBilling = async (req, res) => {
    try {
        const [rows] = await db.query(
            `
            SELECT
                b.bill_id,
                b.patient_id,
                p.name AS patient_name,
                b.item,
                b.amount,
                b.payment_status,
                b.created_at
            FROM billing b
            JOIN patient p ON b.patient_id = p.user_id
            ORDER BY b.bill_id DESC
            `
        );

        return res.status(200).json(rows);
    } catch (error) {
        console.error("allBilling error:", error);

        return res.status(500).json({
            message: "Failed to load billing records",
            error: error.message,
        });
    }
};

const myBilling = async (req, res) => {
    try {
        if (!requireRole(req, res, ["patient"])) {
            return;
        }

        const patientId = getUserId(req);

        const [rows] = await db.query(
            `
            SELECT
                bill_id,
                patient_id,
                item,
                amount,
                payment_status,
                created_at
            FROM billing
            WHERE patient_id = ?
            ORDER BY bill_id DESC
            `,
            [patientId]
        );

        return res.status(200).json(rows);
    } catch (error) {
        console.error("myBilling error:", error);

        return res.status(500).json({
            message: "Failed to load my billing records",
            error: error.message,
        });
    }
};

const createBilling = async (req, res) => {
    try {
        if (!requireRole(req, res, ["admin"])) {
            return;
        }

        const { patient_id, item, amount, payment_status } = req.body;

        if (!patient_id || !item || amount === undefined || amount === null || !payment_status) {
            return res.status(400).json({
                message: "All billing fields are required",
            });
        }

        if (!["paid", "unpaid"].includes(payment_status)) {
            return res.status(400).json({
                message: "Invalid payment status",
            });
        }

        const numericAmount = Number(amount);

        if (Number.isNaN(numericAmount) || numericAmount < 0) {
            return res.status(400).json({
                message: "Amount must be a valid positive number",
            });
        }

        const [patients] = await db.query(
            "SELECT user_id FROM patient WHERE user_id = ?",
            [patient_id]
        );

        if (patients.length === 0) {
            return res.status(404).json({
                message: "Patient ID does not exist",
            });
        }

        const [result] = await db.query(
            `
            INSERT INTO billing(patient_id, item, amount, payment_status)
            VALUES (?, ?, ?, ?)
            `,
            [patient_id, item, numericAmount, payment_status]
        );

        return res.status(201).json({
            message: "Bill added successfully",
            bill_id: result.insertId,
        });
    } catch (error) {
        console.error("createBilling error:", error);

        return res.status(500).json({
            message: "Failed to add bill",
            error: error.message,
        });
    }
};

const allStaff = async (req, res) => {
    try {
        const [rows] = await db.query(
            `
            SELECT
                staff_id,
                name,
                role,
                salary,
                work_assigned,
                created_at
            FROM hospital_staff
            ORDER BY staff_id DESC
            `
        );

        return res.status(200).json(rows);
    } catch (error) {
        console.error("allStaff error:", error);

        return res.status(500).json({
            message: "Failed to load staff records",
            error: error.message,
        });
    }
};

const createStaff = async (req, res) => {
    try {
        if (!requireRole(req, res, ["admin"])) {
            return;
        }

        const { name, role, salary, work_assigned } = req.body;

        if (!name || !role || salary === undefined || salary === null || !work_assigned) {
            return res.status(400).json({
                message: "All staff fields are required",
            });
        }

        const numericSalary = Number(salary);

        if (Number.isNaN(numericSalary) || numericSalary < 0) {
            return res.status(400).json({
                message: "Salary must be a valid positive number",
            });
        }

        const [result] = await db.query(
            `
            INSERT INTO hospital_staff(name, role, salary, work_assigned)
            VALUES (?, ?, ?, ?)
            `,
            [name, role, numericSalary, work_assigned]
        );

        return res.status(201).json({
            message: "Staff added successfully",
            staff_id: result.insertId,
        });
    } catch (error) {
        console.error("createStaff error:", error);

        return res.status(500).json({
            message: "Failed to add staff",
            error: error.message,
        });
    }
};

const allMeetings = async (req, res) => {
    try {
        const [rows] = await db.query(
            `
            SELECT
                meeting_id,
                title,
                meeting_date,
                meeting_time,
                agenda,
                created_at
            FROM staff_meeting
            ORDER BY meeting_id DESC
            `
        );

        return res.status(200).json(rows);
    } catch (error) {
        console.error("allMeetings error:", error);

        return res.status(500).json({
            message: "Failed to load meeting records",
            error: error.message,
        });
    }
};

const createMeeting = async (req, res) => {
    try {
        if (!requireRole(req, res, ["admin"])) {
            return;
        }

        const { title, meeting_date, meeting_time, agenda } = req.body;

        if (!title || !meeting_date || !meeting_time || !agenda) {
            return res.status(400).json({
                message: "All meeting fields are required",
            });
        }

        const [result] = await db.query(
            `
            INSERT INTO staff_meeting(title, meeting_date, meeting_time, agenda)
            VALUES (?, ?, ?, ?)
            `,
            [title, meeting_date, meeting_time, agenda]
        );

        return res.status(201).json({
            message: "Meeting added successfully",
            meeting_id: result.insertId,
        });
    } catch (error) {
        console.error("createMeeting error:", error);

        return res.status(500).json({
            message: "Failed to add meeting",
            error: error.message,
        });
    }
};

const myTracker = async (req, res) => {
    try {
        if (!requireRole(req, res, ["patient"])) {
            return;
        }

        const patientId = getUserId(req);

        const [rows] = await db.query(
            `
            SELECT
                tracker_id,
                patient_id,
                weight,
                bp,
                sugar,
                notes,
                created_at
            FROM health_tracker
            WHERE patient_id = ?
            ORDER BY tracker_id DESC
            `,
            [patientId]
        );

        return res.status(200).json(rows);
    } catch (error) {
        console.error("myTracker error:", error);

        return res.status(500).json({
            message: "Failed to load tracker records",
            error: error.message,
        });
    }
};

const createTracker = async (req, res) => {
    try {
        if (!requireRole(req, res, ["patient"])) {
            return;
        }

        const patientId = getUserId(req);
        const { weight, bp, sugar, notes } = req.body;

        if (!weight || !bp || !sugar) {
            return res.status(400).json({
                message: "Weight, BP and sugar are required",
            });
        }

        const numericWeight = Number(weight);
        const numericSugar = Number(sugar);

        if (Number.isNaN(numericWeight) || numericWeight <= 0) {
            return res.status(400).json({
                message: "Weight must be a valid positive number",
            });
        }

        if (Number.isNaN(numericSugar) || numericSugar < 0) {
            return res.status(400).json({
                message: "Sugar must be a valid number",
            });
        }

        const [result] = await db.query(
            `
            INSERT INTO health_tracker(patient_id, weight, bp, sugar, notes)
            VALUES (?, ?, ?, ?, ?)
            `,
            [patientId, numericWeight, bp, numericSugar, notes || ""]
        );

        return res.status(201).json({
            message: "Tracker saved successfully",
            tracker_id: result.insertId,
        });
    } catch (error) {
        console.error("createTracker error:", error);

        return res.status(500).json({
            message: "Failed to save tracker",
            error: error.message,
        });
    }
};

module.exports = {
    allEMR,
    createEMR,
    allBilling,
    myBilling,
    createBilling,
    allStaff,
    createStaff,
    allMeetings,
    createMeeting,
    myTracker,
    createTracker,
};
