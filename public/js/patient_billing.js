document.addEventListener("DOMContentLoaded", loadRecords);

async function loadRecords() {
    const status = document.getElementById("status");
    const container = document.getElementById("billingContainer");

    status.textContent = "Loading...";
    container.innerHTML = "";

    try {
        const records = await getJSON("/advanced/mybilling");

        status.textContent = `Loaded ${records.length} record(s).`;

        records.forEach((record) => {
            const card = document.createElement("div");
            card.className = "card filter-card";

            card.innerHTML = `<h3>Bill #${safe(record.bill_id)}</h3>
                <div><b>Item:</b> ${safe(record.item)}</div>
                <div><b>Amount:</b> ${money(record.amount)}</div>
                <div><b>Status:</b> ${badge(record.payment_status)}</div>`;

            container.appendChild(card);
        });
    } catch (error) {
        status.innerHTML = `<span class="error">${error.message}</span>`;
    }
}
