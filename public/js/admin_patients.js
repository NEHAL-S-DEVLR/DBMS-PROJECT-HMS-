document.addEventListener("DOMContentLoaded", loadRecords);

async function loadRecords() {
    const status = document.getElementById("status");
    const container = document.getElementById("patientContainer");

    status.textContent = "Loading...";
    container.innerHTML = "";

    try {
        const records = await getJSON("/loaddata/patientlist");

        status.textContent = `Loaded ${records.length} record(s).`;

        records.forEach((record) => {
            const card = document.createElement("div");
            card.className = "card filter-card";

            card.innerHTML = `<h3>${safe(record.name)}</h3>
                <p>${badge("active")} Patient</p>
                <div><b>ID:</b> ${safe(record.user_id)}</div>
                <div><b>Email:</b> ${safe(record.email)}</div>
                <div><b>Phone:</b> ${safe(record.phone_no)}</div>`;

            container.appendChild(card);
        });
    } catch (error) {
        status.innerHTML = `<span class="error">${error.message}</span>`;
    }
}
