document.addEventListener("DOMContentLoaded", loadRecords);

async function loadRecords() {
    const status = document.getElementById("status");
    const container = document.getElementById("prescriptionContainer");

    status.textContent = "Loading prescriptions...";
    container.innerHTML = "";

    try {
        const prescriptions = await getJSON("/medical/prescriptions");

        status.textContent = `Loaded ${prescriptions.length} prescription(s).`;

        if (prescriptions.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <h3>No Prescriptions Found</h3>
                    <p>Prescriptions created by doctors will appear here.</p>
                </div>
            `;
            return;
        }

        prescriptions.forEach((prescription) => {
            const card = document.createElement("div");
            card.className = "card filter-card";

            card.innerHTML = `
                <h3>Prescription #${safe(prescription.prescription_id)}</h3>

                <div><b>Appointment ID:</b> ${safe(prescription.appointment_id)}</div>
                <div><b>Patient:</b> ${safe(prescription.patient_name)}</div>
                <div><b>Doctor:</b> ${safe(prescription.doctor_name)}</div>

                <hr>

                <div><b>Medicine:</b> ${safe(prescription.medicine_name)}</div>
                <div><b>Dosage:</b> ${safe(prescription.dosage)}</div>
                <div><b>Duration:</b> ${safe(prescription.duration_days)} days</div>
                <div><b>Notes:</b> ${safe(prescription.notes)}</div>
                <div><b>Created:</b> ${safe(prescription.created_at)}</div>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        console.error("Admin prescription load error:", error);

        status.innerHTML = `<span class="error">${error.message}</span>`;
    }
}
