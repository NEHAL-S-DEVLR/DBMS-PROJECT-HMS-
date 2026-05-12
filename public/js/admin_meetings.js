document.addEventListener("DOMContentLoaded", () => {
    loadRecords();

    const form = document.getElementById("meetingForm");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const result = document.getElementById("result");

        try {
            const data = await postJSON("/advanced/meeting", {
                title: document.getElementById("title").value,
                meeting_date: document.getElementById("meeting_date").value,
                meeting_time: document.getElementById("meeting_time").value,
                agenda: document.getElementById("agenda").value,
            });

            result.value = data.message || "Meeting added";
            form.reset();
            loadRecords();
            toast("Meeting added");
        } catch (error) {
            result.value = error.message;
        }
    });
});

async function loadRecords() {
    const status = document.getElementById("status");
    const container = document.getElementById("meetingContainer");

    status.textContent = "Loading...";
    container.innerHTML = "";

    try {
        const records = await getJSON("/advanced/meetings");

        status.textContent = `Loaded ${records.length} record(s).`;

        records.forEach((record) => {
            const card = document.createElement("div");
            card.className = "card filter-card";

            card.innerHTML = `
                <h3>${safe(record.title)}</h3>
                <div><b>Date:</b> ${safe(record.meeting_date)}</div>
                <div><b>Time:</b> ${safe(record.meeting_time)}</div>
                <div><b>Agenda:</b> ${safe(record.agenda)}</div>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        status.innerHTML = `<span class="error">${error.message}</span>`;
    }
}
