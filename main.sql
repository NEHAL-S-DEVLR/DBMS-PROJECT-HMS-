CREATE DATABASE IF NOT EXISTS project;
USE project;

DROP TABLE IF EXISTS appointment;
DROP TABLE IF EXISTS patient;
DROP TABLE IF EXISTS doctor;
DROP TABLE IF EXISTS login;

CREATE TABLE login (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('patient','doctor','admin') NOT NULL,
    is_active ENUM('active','deactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patient (
    user_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone_no VARCHAR(15) UNIQUE NOT NULL,
    dob DATE NOT NULL,
    gender ENUM('male','female') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES login(user_id)
    ON DELETE CASCADE
);

CREATE TABLE doctor (
    user_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    phone_no VARCHAR(15) UNIQUE,
    dob DATE NOT NULL,
    gender ENUM('male','female') NOT NULL,

    FOREIGN KEY (user_id)
    REFERENCES login(user_id)
    ON DELETE CASCADE
);

CREATE TABLE appointment (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,

    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,

    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,

    reason VARCHAR(255) NOT NULL,

    request ENUM(
        'pending',
        'confirmed',
        'declined',
        'completed'
    ) DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id)
    REFERENCES patient(user_id)
    ON DELETE CASCADE,

    FOREIGN KEY (doctor_id)
    REFERENCES doctor(user_id)
    ON DELETE CASCADE
);

INSERT INTO login(email,password,role,is_active)
VALUES (
    'admin@h.com',
    'admin',
    'admin',
    'active'
);
