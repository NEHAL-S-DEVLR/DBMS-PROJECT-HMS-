document.addEventListener("DOMContentLoaded", () => {
    loadRecords();

    const form = document.getElementById("staffForm");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const result = document.getElementById("result");

        try {
            const data = await postJSON("/advanced/staff", {
                name: document.getElementById("staffName").value,
                role: document.getElementById("staffRole").value,
                salary: document.getElementById("staffSalary").value,
                work_assigned: document.getElementById("staffWork").value,
            });

            result.value = data.message || "Staff added";
            form.reset();
            loadRecords();
            toast("Staff added");
        } catch (error) {
            result.value = error.message;
        }
    });
});

async function loadRecords() {
    const status = document.getElementById("status");
    const container = document.getElementById("staffContainer");

    status.textContent = "Loading...";
    container.innerHTML = "";

    try {
        const records = await getJSON("/advanced/staff");

        status.textContent = `Loaded ${records.length} record(s).`;

        records.forEach((record) => {
            const card = document.createElement("div");
            card.className = "card filter-card";

            card.innerHTML = `
                <h3>${safe(record.name)}</h3>
                <div><b>Role:</b> ${safe(record.role)}</div>
                <div><b>Salary:</b> ${money(record.salary)}</div>
                <div><b>Work:</b> ${safe(record.work_assigned)}</div>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        status.innerHTML = `<span class="error">${error.message}</span>`;
    }
}
