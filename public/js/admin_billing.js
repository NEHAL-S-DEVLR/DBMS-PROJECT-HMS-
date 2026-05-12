document.addEventListener("DOMContentLoaded", () => {
    loadRecords();

    const form = document.getElementById("billingForm");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const result = document.getElementById("result");

        try {
            const data = await postJSON("/advanced/billing", {
                patient_id: document.getElementById("patient_id").value,
                item: document.getElementById("item").value,
                amount: document.getElementById("amount").value,
                payment_status: document.getElementById("payment_status").value,
            });

            result.value = data.message || "Bill added";
            form.reset();
            loadRecords();
            toast("Bill added");
        } catch (error) {
            result.value = error.message;
        }
    });
});

async function loadRecords() {
    const status = document.getElementById("status");
    const container = document.getElementById("billingContainer");

    status.textContent = "Loading...";
    container.innerHTML = "";

    try {
        const records = await getJSON("/advanced/billing");

        status.textContent = `Loaded ${records.length} record(s).`;

        records.forEach((record) => {
            const card = document.createElement("div");
            card.className = "card filter-card";

            card.innerHTML = `
                <h3>Bill #${safe(record.bill_id)}</h3>
                <div><b>Patient:</b> ${safe(record.patient_name)}</div>
                <div><b>Item:</b> ${safe(record.item)}</div>
                <div><b>Amount:</b> ${money(record.amount)}</div>
                <div><b>Status:</b> ${badge(record.payment_status)}</div>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        status.innerHTML = `<span class="error">${error.message}</span>`;
    }
}
