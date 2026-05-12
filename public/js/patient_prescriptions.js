document.addEventListener("DOMContentLoaded", loadRecords);

async function loadRecords() {
    const status = document.getElementById("status");
    const container = document.getElementById("prescriptionContainer");

    status.textContent = "Loading...";
    container.innerHTML = "";

    try {
        const prescriptions = await getJSON("/medical/myprescriptions");

        status.textContent = `Loaded ${prescriptions.length} record(s).`;

        prescriptions.forEach((prescription) => {
            const card = document.createElement("div");
            card.className = "card filter-card";

            card.innerHTML = `
                <h3>Prescription #${safe(prescription.prescription_id)}</h3>
                <div><b>Doctor:</b> ${safe(prescription.doctor_name)}</div>
                <div><b>Medicine:</b> ${safe(prescription.medicine_name)}</div>
                <div><b>Dosage:</b> ${safe(prescription.dosage)}</div>
                <div><b>Duration:</b> ${safe(prescription.duration_days)} days</div>

                <button class="btn-outline" onclick="localStorage.setItem('prescription_id', '${prescription.prescription_id}'); location.href='patient_pharmacy.html';">
                    Order Medicine
                </button>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        status.innerHTML = `<span class="error">${error.message}</span>`;
    }
}
