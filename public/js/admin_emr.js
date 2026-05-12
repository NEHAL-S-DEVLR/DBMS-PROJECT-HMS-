document.addEventListener("DOMContentLoaded", loadRecords);

async function loadRecords() {
    const status = document.getElementById("status");
    const container = document.getElementById("emrContainer");

    status.textContent = "Loading...";
    container.innerHTML = "";

    try {
        const records = await getJSON("/advanced/emr");

        status.textContent = `Loaded ${records.length} record(s).`;

        records.forEach((record) => {
            const card = document.createElement("div");
            card.className = "card filter-card";

            card.innerHTML = `<h3>EMR #${safe(record.emr_id)}</h3>
                <div><b>Patient:</b> ${safe(record.patient_name)}</div>
                <div><b>Doctor:</b> ${safe(record.doctor_name)}</div>
                <div><b>Diagnosis:</b> ${safe(record.diagnosis)}</div>
                <div><b>Vitals:</b> ${safe(record.vitals)}</div>
                <div><b>Notes:</b> ${safe(record.clinical_notes)}</div>`;

            container.appendChild(card);
        });
    } catch (error) {
        status.innerHTML = `<span class="error">${error.message}</span>`;
    }
}
