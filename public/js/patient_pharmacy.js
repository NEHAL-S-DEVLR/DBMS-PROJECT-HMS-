document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("prescription_id").value =
        localStorage.getItem("prescription_id") || "";

    loadRecords();

    const form = document.getElementById("pharmacyForm");
    const result = document.getElementById("result");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const prescriptionId = document.getElementById("prescription_id").value.trim();
        const deliveryAddress = document.getElementById("delivery_address").value.trim();
        const notes = document.getElementById("notes").value.trim();

        if (!prescriptionId || !deliveryAddress) {
            result.value = "Prescription ID and address are required";
            return;
        }

        try {
            const data = await postJSON("/medical/pharmacyorder", {
                prescription_id: prescriptionId,
                delivery_address: deliveryAddress,
                notes,
            });

            result.value = data.message || "Order placed";
            form.reset();
            loadRecords();
            toast("Order placed");
        } catch (error) {
            result.value = error.message;
        }
    });
});

async function loadRecords() {
    const status = document.getElementById("status");
    const container = document.getElementById("orderContainer");

    status.textContent = "Loading...";
    container.innerHTML = "";

    try {
        const orders = await getJSON("/medical/mypharmacyorders");

        status.textContent = `Loaded ${orders.length} record(s).`;

        orders.forEach((order) => {
            const card = document.createElement("div");
            card.className = "card filter-card";

            card.innerHTML = `
                <h3>Order #${safe(order.order_id)}</h3>
                <div><b>Medicine:</b> ${safe(order.medicine_name)}</div>
                <div><b>Address:</b> ${safe(order.delivery_address)}</div>
                <div><b>Status:</b> ${badge(order.order_status)}</div>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        status.innerHTML = `<span class="error">${error.message}</span>`;
    }
}