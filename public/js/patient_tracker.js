document.addEventListener("DOMContentLoaded", () => {
    loadRecords();

    const form = document.getElementById("trackerForm");
    const result = document.getElementById("result");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
            const data = await postJSON("/advanced/tracker", {
                weight: document.getElementById("weight").value,
                bp: document.getElementById("bp").value,
                sugar: document.getElementById("sugar").value,
                notes: document.getElementById("notes").value,
            });

            result.value = data.message || "Tracker saved";
            form.reset();
            loadRecords();
            toast("Tracker saved");
        } catch (error) {
            result.value = error.message;
        }
    });
});

async function loadRecords() {
    const status = document.getElementById("status");
    const container = document.getElementById("trackerContainer");

    status.textContent = "Loading...";
    container.innerHTML = "";

    try {
        const trackers = await getJSON("/advanced/mytracker");

        status.textContent = `Loaded ${trackers.length} record(s).`;

        trackers.forEach((tracker) => {
            const card = document.createElement("div");
            card.className = "card filter-card";

            card.innerHTML = `
                <h3>Tracker #${safe(tracker.tracker_id)}</h3>
                <div><b>Weight:</b> ${safe(tracker.weight)}</div>
                <div><b>BP:</b> ${safe(tracker.bp)}</div>
                <div><b>Sugar:</b> ${safe(tracker.sugar)}</div>
                <div><b>Notes:</b> ${safe(tracker.notes)}</div>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        status.innerHTML = `<span class="error">${error.message}</span>`;
    }
}
