-- ============================================================
-- MEDNEXUS / HMS DBMS PROJECT - FINAL CLEAN main.sql
-- Database name: project
--
-- Use this file in MySQL Workbench:
-- 1. Open MySQL Workbench
-- 2. Open this main.sql
-- 3. Press the lightning button
--
-- WARNING:
-- This script DROPS and recreates the whole project database.
-- Old data will be deleted.
-- ============================================================

DROP DATABASE IF EXISTS project;
CREATE DATABASE project;
USE project;

-- ============================================================
-- 1. AUTHENTICATION TABLE
-- ============================================================

CREATE TABLE login (
    user_id INT AUTO_INCREMENT PRIMARY KEY,

    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,

    role ENUM('patient', 'doctor', 'admin') NOT NULL,

    is_active ENUM('active', 'deactive') DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_login_email
        CHECK (email LIKE '%@%')
);

-- ============================================================
-- 2. PATIENT TABLE
-- ============================================================

CREATE TABLE patient (
    user_id INT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    phone_no VARCHAR(15) NOT NULL UNIQUE,
    dob DATE NOT NULL,
    gender ENUM('male', 'female') NOT NULL,

    blood_group VARCHAR(10),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_patient_login
        FOREIGN KEY (user_id)
        REFERENCES login(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_patient_name
        CHECK (CHAR_LENGTH(TRIM(name)) >= 2),

    CONSTRAINT chk_patient_phone
        CHECK (CHAR_LENGTH(phone_no) BETWEEN 10 AND 15)
);

-- ============================================================
-- 3. DOCTOR TABLE
-- ============================================================

CREATE TABLE doctor (
    user_id INT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    phone_no VARCHAR(15) UNIQUE,
    dob DATE NOT NULL,
    gender ENUM('male', 'female') NOT NULL,

    experience_years INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_doctor_login
        FOREIGN KEY (user_id)
        REFERENCES login(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_doctor_name
        CHECK (CHAR_LENGTH(TRIM(name)) >= 2),

    CONSTRAINT chk_doctor_experience
        CHECK (experience_years >= 0)
);

-- ============================================================
-- 4. APPOINTMENT TABLE
-- ============================================================

CREATE TABLE appointment (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,

    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,

    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,

    reason VARCHAR(255) NOT NULL,

    request ENUM('pending', 'confirmed', 'declined', 'completed') DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_appointment_patient
        FOREIGN KEY (patient_id)
        REFERENCES patient(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_appointment_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES doctor(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ============================================================
-- 5. APPOINTMENT CHAT / MESSAGES TABLE
-- Backend:
-- GET    /loaddata/loadmessages
-- POST   /request/sendmessage
-- DELETE /request/deletechat
-- ============================================================

CREATE TABLE appointment_messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,

    appointment_id INT NOT NULL,
    sender_user_id INT NOT NULL,
    sender_role ENUM('doctor', 'patient') NOT NULL,

    message_text TEXT NOT NULL,

    is_deleted BOOLEAN DEFAULT 0,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_message_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES appointment(appointment_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ============================================================
-- 6. PRESCRIPTION TABLE
-- Backend:
-- POST /medical/prescription
-- GET  /medical/prescriptions
-- GET  /medical/myprescriptions
-- ============================================================

CREATE TABLE prescription (
    prescription_id INT AUTO_INCREMENT PRIMARY KEY,

    appointment_id INT NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,

    medicine_name VARCHAR(150) NOT NULL,
    dosage VARCHAR(150) NOT NULL,
    duration_days INT NOT NULL,
    notes VARCHAR(500),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_prescription_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES appointment(appointment_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_prescription_patient
        FOREIGN KEY (patient_id)
        REFERENCES patient(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_prescription_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES doctor(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_prescription_duration
        CHECK (duration_days > 0)
);

-- ============================================================
-- 7. PHARMACY ORDER TABLE
-- Backend:
-- POST /medical/pharmacyorder
-- GET  /medical/pharmacyorders
-- GET  /medical/mypharmacyorders
--
-- IMPORTANT:
-- Use order_status, not status.
-- ============================================================

CREATE TABLE pharmacy_order (
    order_id INT AUTO_INCREMENT PRIMARY KEY,

    prescription_id INT NOT NULL,
    patient_id INT NOT NULL,

    delivery_address VARCHAR(255) NOT NULL,
    notes VARCHAR(500),

    order_status ENUM('pending', 'packed', 'delivered', 'cancelled') DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_prescription
        FOREIGN KEY (prescription_id)
        REFERENCES prescription(prescription_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_order_patient
        FOREIGN KEY (patient_id)
        REFERENCES patient(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ============================================================
-- 8. EMR TABLE
-- Backend:
-- POST /advanced/emr
-- GET  /advanced/emr
--
-- IMPORTANT:
-- Use vitals and clinical_notes, not blood_pressure/heart_rate/etc.
-- ============================================================

CREATE TABLE emr (
    emr_id INT AUTO_INCREMENT PRIMARY KEY,

    appointment_id INT NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,

    diagnosis VARCHAR(255) NOT NULL,
    vitals VARCHAR(255) NOT NULL,
    allergies VARCHAR(255),
    clinical_notes VARCHAR(700),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_emr_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES appointment(appointment_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_emr_patient
        FOREIGN KEY (patient_id)
        REFERENCES patient(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_emr_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES doctor(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ============================================================
-- 9. BILLING TABLE
-- Backend:
-- POST /advanced/billing
-- GET  /advanced/billing
-- GET  /advanced/mybilling
--
-- IMPORTANT:
-- payment_status must be paid/unpaid because frontend sends unpaid.
-- ============================================================

CREATE TABLE billing (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,

    patient_id INT NOT NULL,

    item VARCHAR(150) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,

    payment_status ENUM('paid', 'unpaid') DEFAULT 'unpaid',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_billing_patient
        FOREIGN KEY (patient_id)
        REFERENCES patient(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_billing_amount
        CHECK (amount >= 0)
);

-- ============================================================
-- 10. HOSPITAL STAFF TABLE
-- Backend:
-- POST /advanced/staff
-- GET  /advanced/staff
--
-- IMPORTANT:
-- Use salary and work_assigned, not shift_time/phone.
-- ============================================================

CREATE TABLE hospital_staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    work_assigned VARCHAR(255) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_staff_salary
        CHECK (salary >= 0)
);

-- ============================================================
-- 11. STAFF MEETING TABLE
-- Backend:
-- POST /advanced/meeting
-- GET  /advanced/meetings
--
-- IMPORTANT:
-- Use meeting_time and agenda, not description only.
-- ============================================================

CREATE TABLE staff_meeting (
    meeting_id INT AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(150) NOT NULL,
    meeting_date DATE NOT NULL,
    meeting_time VARCHAR(50) NOT NULL,
    agenda VARCHAR(500) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 12. HEALTH TRACKER TABLE
-- Backend:
-- POST /advanced/tracker
-- GET  /advanced/mytracker
--
-- IMPORTANT:
-- Use bp and sugar, not sugar_level/blood_pressure.
-- ============================================================

CREATE TABLE health_tracker (
    tracker_id INT AUTO_INCREMENT PRIMARY KEY,

    patient_id INT NOT NULL,

    weight DECIMAL(5,2) NOT NULL,
    bp VARCHAR(20) NOT NULL,
    sugar DECIMAL(6,2) NOT NULL,
    notes VARCHAR(500),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tracker_patient
        FOREIGN KEY (patient_id)
        REFERENCES patient(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_tracker_weight
        CHECK (weight > 0),

    CONSTRAINT chk_tracker_sugar
        CHECK (sugar >= 0)
);

-- ============================================================
-- 13. ADMIN LOGS TABLE
-- Used by triggers for DBMS marks.
-- ============================================================

CREATE TABLE admin_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,

    action VARCHAR(255) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 14. INDEXES
-- DBMS optimization marks.
-- ============================================================

CREATE INDEX idx_login_email_role
ON login(email, role);

CREATE INDEX idx_patient_name
ON patient(name);

CREATE INDEX idx_doctor_specialization
ON doctor(specialization);

CREATE INDEX idx_appointment_patient
ON appointment(patient_id);

CREATE INDEX idx_appointment_doctor
ON appointment(doctor_id);

CREATE INDEX idx_appointment_status
ON appointment(request);

CREATE INDEX idx_message_appointment
ON appointment_messages(appointment_id);

CREATE INDEX idx_message_sender
ON appointment_messages(sender_user_id);

CREATE INDEX idx_prescription_patient
ON prescription(patient_id);

CREATE INDEX idx_prescription_doctor
ON prescription(doctor_id);

CREATE INDEX idx_pharmacy_patient
ON pharmacy_order(patient_id);

CREATE INDEX idx_billing_patient
ON billing(patient_id);

CREATE INDEX idx_tracker_patient
ON health_tracker(patient_id);

-- ============================================================
-- 15. VIEWS
-- DBMS joins and report presentation.
-- ============================================================

CREATE VIEW active_doctors_view AS
SELECT
    d.user_id,
    d.name,
    l.email,
    d.specialization,
    d.phone_no,
    d.gender,
    d.experience_years
FROM doctor d
JOIN login l
    ON d.user_id = l.user_id
WHERE l.role = 'doctor'
  AND l.is_active = 'active';

CREATE VIEW patient_profile_view AS
SELECT
    p.user_id,
    p.name,
    l.email,
    p.phone_no,
    p.dob,
    p.gender,
    p.blood_group,
    p.created_at
FROM patient p
JOIN login l
    ON p.user_id = l.user_id
WHERE l.role = 'patient';

CREATE VIEW appointment_full_view AS
SELECT
    a.appointment_id,

    p.user_id AS patient_id,
    p.name AS patient_name,

    d.user_id AS doctor_id,
    d.name AS doctor_name,
    d.specialization,

    a.appointment_date,
    a.appointment_time,
    a.reason,
    a.request AS request_status,
    a.created_at
FROM appointment a
JOIN patient p
    ON a.patient_id = p.user_id
JOIN doctor d
    ON a.doctor_id = d.user_id;

CREATE VIEW prescription_full_view AS
SELECT
    pr.prescription_id,
    pr.appointment_id,

    p.user_id AS patient_id,
    p.name AS patient_name,

    d.user_id AS doctor_id,
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
    ON pr.doctor_id = d.user_id;

CREATE VIEW patient_billing_view AS
SELECT
    b.bill_id,

    p.user_id AS patient_id,
    p.name AS patient_name,

    b.item,
    b.amount,
    b.payment_status,
    b.created_at
FROM billing b
JOIN patient p
    ON b.patient_id = p.user_id;

CREATE VIEW pharmacy_order_full_view AS
SELECT
    po.order_id,
    po.prescription_id,

    p.user_id AS patient_id,
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
    ON po.prescription_id = pr.prescription_id;

-- ============================================================
-- 16. TRIGGERS
-- DBMS marks: automatic logging.
-- ============================================================

DELIMITER //

CREATE TRIGGER trg_after_appointment_insert
AFTER INSERT ON appointment
FOR EACH ROW
BEGIN
    INSERT INTO admin_logs(action)
    VALUES (
        CONCAT(
            'New appointment created. Appointment ID: ',
            NEW.appointment_id,
            ', Patient ID: ',
            NEW.patient_id,
            ', Doctor ID: ',
            NEW.doctor_id
        )
    );
END //

CREATE TRIGGER trg_after_prescription_insert
AFTER INSERT ON prescription
FOR EACH ROW
BEGIN
    INSERT INTO admin_logs(action)
    VALUES (
        CONCAT(
            'Prescription created. Prescription ID: ',
            NEW.prescription_id,
            ', Appointment ID: ',
            NEW.appointment_id
        )
    );
END //

CREATE TRIGGER trg_after_billing_insert
AFTER INSERT ON billing
FOR EACH ROW
BEGIN
    INSERT INTO admin_logs(action)
    VALUES (
        CONCAT(
            'Bill generated. Bill ID: ',
            NEW.bill_id,
            ', Patient ID: ',
            NEW.patient_id,
            ', Amount: ',
            NEW.amount
        )
    );
END //

-- ============================================================
-- 17. STORED PROCEDURES
-- DBMS marks.
-- ============================================================

CREATE PROCEDURE GetPatientAppointments(IN pid INT)
BEGIN
    SELECT *
    FROM appointment_full_view
    WHERE patient_id = pid
    ORDER BY appointment_date DESC, appointment_time DESC;
END //

CREATE PROCEDURE GetDoctorAppointments(IN did INT)
BEGIN
    SELECT *
    FROM appointment_full_view
    WHERE doctor_id = did
    ORDER BY appointment_date DESC, appointment_time DESC;
END //

CREATE PROCEDURE GetPatientBilling(IN pid INT)
BEGIN
    SELECT *
    FROM patient_billing_view
    WHERE patient_id = pid
    ORDER BY created_at DESC;
END //

CREATE PROCEDURE GetPatientPrescriptions(IN pid INT)
BEGIN
    SELECT *
    FROM prescription_full_view
    WHERE patient_id = pid
    ORDER BY created_at DESC;
END //

-- ============================================================
-- 18. FUNCTIONS
-- DBMS marks.
-- ============================================================

CREATE FUNCTION totalAppointments(pid INT)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE total INT;

    SELECT COUNT(*)
    INTO total
    FROM appointment
    WHERE patient_id = pid;

    RETURN total;
END //

CREATE FUNCTION totalPatientBills(pid INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE total DECIMAL(10,2);

    SELECT IFNULL(SUM(amount), 0)
    INTO total
    FROM billing
    WHERE patient_id = pid;

    RETURN total;
END //

CREATE FUNCTION totalDoctorAppointments(did INT)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE total INT;

    SELECT COUNT(*)
    INTO total
    FROM appointment
    WHERE doctor_id = did;

    RETURN total;
END //

DELIMITER ;

-- ============================================================
-- 19. DEFAULT ACCOUNTS
-- Passwords are plain text because your current login controller
-- compares plain text.
--
-- Admin:
-- email: admin@h.com
-- password: admin
--
-- Doctor:
-- email: doctor@h.com
-- password: doctor
--
-- Patient:
-- email: patient@h.com
-- password: patient
-- ============================================================

INSERT INTO login(email, password, role, is_active)
VALUES
('admin@h.com', 'admin', 'admin', 'active'),
('doctor@h.com', 'doctor', 'doctor', 'active'),
('patient@h.com', 'patient', 'patient', 'active');

SET @doctor_id = (
    SELECT user_id
    FROM login
    WHERE email = 'doctor@h.com'
);

SET @patient_id = (
    SELECT user_id
    FROM login
    WHERE email = 'patient@h.com'
);

INSERT INTO doctor(
    user_id,
    name,
    specialization,
    phone_no,
    dob,
    gender,
    experience_years
)
VALUES (
    @doctor_id,
    'Dr. Sample Kumar',
    'General Medicine',
    '9876543210',
    '1985-05-10',
    'male',
    8
);

INSERT INTO patient(
    user_id,
    name,
    phone_no,
    dob,
    gender,
    blood_group
)
VALUES (
    @patient_id,
    'Sample Patient',
    '9876501234',
    '2003-02-15',
    'male',
    'O+'
);

INSERT INTO appointment(
    patient_id,
    doctor_id,
    appointment_date,
    appointment_time,
    reason,
    request
)
VALUES (
    @patient_id,
    @doctor_id,
    CURDATE(),
    '10:30 AM',
    'General checkup',
    'confirmed'
);

INSERT INTO billing(
    patient_id,
    item,
    amount,
    payment_status
)
VALUES (
    @patient_id,
    'Sample Consultation Fee',
    500,
    'unpaid'
);

INSERT INTO hospital_staff(
    name,
    role,
    salary,
    work_assigned
)
VALUES (
    'Ramesh Kumar',
    'Receptionist',
    25000,
    'Front desk and patient registration'
);

INSERT INTO staff_meeting(
    title,
    meeting_date,
    meeting_time,
    agenda
)
VALUES (
    'Weekly Staff Meeting',
    CURDATE(),
    '09:00 AM',
    'Discuss appointments, billing and pharmacy operations'
);

INSERT INTO health_tracker(
    patient_id,
    weight,
    bp,
    sugar,
    notes
)
VALUES (
    @patient_id,
    70.50,
    '120/80',
    95.00,
    'Sample health tracker record'
);

-- ============================================================
-- 20. FINAL VERIFICATION OUTPUT
-- These SELECT statements help you confirm everything worked.
-- ============================================================

SHOW TABLES;

SELECT * FROM login;
SELECT * FROM patient;
SELECT * FROM doctor;
SELECT * FROM appointment_full_view;
SELECT * FROM patient_billing_view;
SELECT * FROM hospital_staff;
SELECT * FROM health_tracker;
SELECT * FROM admin_logs;
