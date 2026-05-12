document.addEventListener("DOMContentLoaded", loadRecords);

async function loadRecords() {
    const status = document.getElementById("status");
    const container = document.getElementById("orderContainer");

    status.textContent = "Loading...";
    container.innerHTML = "";

    try {
        const records = await getJSON("/medical/pharmacyorders");

        status.textContent = `Loaded ${records.length} record(s).`;

        records.forEach((record) => {
            const card = document.createElement("div");
            card.className = "card filter-card";

            card.innerHTML = `<h3>Order #${safe(record.order_id)}</h3>
                <div><b>Patient:</b> ${safe(record.patient_name)}</div>
                <div><b>Medicine:</b> ${safe(record.medicine_name)}</div>
                <div><b>Address:</b> ${safe(record.delivery_address)}</div>
                <div><b>Status:</b> ${badge(record.order_status)}</div>`;

            container.appendChild(card);
        });
    } catch (error) {
        status.innerHTML = `<span class="error">${error.message}</span>`;
    }
}
