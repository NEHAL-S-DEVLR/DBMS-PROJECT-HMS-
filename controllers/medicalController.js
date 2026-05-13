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

const createPrescription = async (req, res) => {
    try {
        if (!requireRole(req, res, ["doctor"])) {
            return;
        }

        const doctorId = getUserId(req);

        const {
            appointment_id,
            medicine_name,
            dosage,
            duration_days,
            notes,
        } = req.body;

        if (!appointment_id || !medicine_name || !dosage || !duration_days) {
            return res.status(400).json({
                message: "Appointment ID, medicine, dosage and duration are required",
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

        const [result] = await db.query(
            `
            INSERT INTO prescription
                (appointment_id, patient_id, doctor_id, medicine_name, dosage, duration_days, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                appointment.appointment_id,
                appointment.patient_id,
                appointment.doctor_id,
                medicine_name,
                dosage,
                duration_days,
                notes || "",
            ]
        );

        return res.status(201).json({
            message: "Prescription created successfully",
            prescription_id: result.insertId,
        });
    } catch (error) {
        console.error("createPrescription error:", error);

        return res.status(500).json({
            message: "Failed to create prescription",
            error: error.message,
        });
    }
};

const allPrescriptions = async (req, res) => {
    try {
        const [rows] = await db.query(
            `
            SELECT
                pr.prescription_id,
                pr.appointment_id,

                pr.patient_id,
                p.name AS patient_name,

                pr.doctor_id,
                d.name AS doctor_name,

                pr.medicine_name,
                pr.dosage,
                pr.duration_days,
                pr.notes,
                pr.created_at
            FROM prescription pr
            JOIN patient p
                ON pr.patient_id = p.user_id
            JOIN doctor d
                ON pr.doctor_id = d.user_id
            ORDER BY pr.prescription_id DESC
            `
        );

        return res.status(200).json(rows);
    } catch (error) {
        console.error("allPrescriptions error:", error);

        return res.status(500).json({
            message: "Failed to load prescriptions",
            error: error.message,
        });
    }
};

const myPrescriptions = async (req, res) => {
    try {
        if (!requireRole(req, res, ["patient"])) {
            return;
        }

        const patientId = getUserId(req);

        const [rows] = await db.query(
            `
            SELECT
                pr.prescription_id,
                pr.appointment_id,

                pr.patient_id,
                p.name AS patient_name,

                pr.doctor_id,
                d.name AS doctor_name,

                pr.medicine_name,
                pr.dosage,
                pr.duration_days,
                pr.notes,
                pr.created_at
            FROM prescription pr
            JOIN patient p
                ON pr.patient_id = p.user_id
            JOIN doctor d
                ON pr.doctor_id = d.user_id
            WHERE pr.patient_id = ?
            ORDER BY pr.prescription_id DESC
            `,
            [patientId]
        );

        return res.status(200).json(rows);
    } catch (error) {
        console.error("myPrescriptions error:", error);

        return res.status(500).json({
            message: "Failed to load my prescriptions",
            error: error.message,
        });
    }
};

const createPharmacyOrder = async (req, res) => {
    try {
        if (!requireRole(req, res, ["patient"])) {
            return;
        }

        const patientId = getUserId(req);

        const {
            prescription_id,
            delivery_address,
            notes,
        } = req.body;

        if (!prescription_id || !delivery_address) {
            return res.status(400).json({
                message: "Prescription ID and delivery address are required",
            });
        }

        const [prescriptions] = await db.query(
            `
            SELECT prescription_id, patient_id
            FROM prescription
            WHERE prescription_id = ?
            AND patient_id = ?
            `,
            [prescription_id, patientId]
        );

        if (prescriptions.length === 0) {
            return res.status(404).json({
                message: "Prescription not found for this patient",
            });
        }

        const [result] = await db.query(
            `
            INSERT INTO pharmacy_order
                (prescription_id, patient_id, delivery_address, notes, order_status)
            VALUES (?, ?, ?, ?, 'pending')
            `,
            [
                prescription_id,
                patientId,
                delivery_address,
                notes || "",
            ]
        );

        return res.status(201).json({
            message: "Pharmacy order placed successfully",
            order_id: result.insertId,
        });
    } catch (error) {
        console.error("createPharmacyOrder error:", error);

        return res.status(500).json({
            message: "Failed to place pharmacy order",
            error: error.message,
        });
    }
};

const allPharmacyOrders = async (req, res) => {
    try {
        const [rows] = await db.query(
            `
            SELECT
                po.order_id,
                po.prescription_id,

                po.patient_id,
                p.name AS patient_name,

                pr.medicine_name,

                po.delivery_address,
                po.notes,
                po.order_status,
                po.created_at
            FROM pharmacy_order po
            JOIN patient p
                ON po.patient_id = p.user_id
            JOIN prescription pr
                ON po.prescription_id = pr.prescription_id
            ORDER BY po.order_id DESC
            `
        );

        return res.status(200).json(rows);
    } catch (error) {
        console.error("allPharmacyOrders error:", error);

        return res.status(500).json({
            message: "Failed to load pharmacy orders",
            error: error.message,
        });
    }
};

const myPharmacyOrders = async (req, res) => {
    try {
        if (!requireRole(req, res, ["patient"])) {
            return;
        }

        const patientId = getUserId(req);

        const [rows] = await db.query(
            `
            SELECT
                po.order_id,
                po.prescription_id,

                po.patient_id,
                p.name AS patient_name,

                pr.medicine_name,

                po.delivery_address,
                po.notes,
                po.order_status,
                po.created_at
            FROM pharmacy_order po
            JOIN patient p
                ON po.patient_id = p.user_id
            JOIN prescription pr
                ON po.prescription_id = pr.prescription_id
            WHERE po.patient_id = ?
            ORDER BY po.order_id DESC
            `,
            [patientId]
        );

        return res.status(200).json(rows);
    } catch (error) {
        console.error("myPharmacyOrders error:", error);

        return res.status(500).json({
            message: "Failed to load my pharmacy orders",
            error: error.message,
        });
    }
};

module.exports = {
    createPrescription,
    allPrescriptions,
    myPrescriptions,
    createPharmacyOrder,
    allPharmacyOrders,
    myPharmacyOrders,
};