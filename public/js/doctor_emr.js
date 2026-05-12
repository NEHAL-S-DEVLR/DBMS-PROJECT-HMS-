document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("emrForm");
    const result = document.getElementById("result");
    const appointmentId = document.getElementById("appointment_id");

    appointmentId.value = localStorage.getItem("appointment_id") || "";

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
            const data = await postJSON("/advanced/emr", {
                appointment_id: appointmentId.value,
                diagnosis: document.getElementById("diagnosis").value,
                vitals: document.getElementById("vitals").value,
                allergies: document.getElementById("allergies").value,
                clinical_notes: document.getElementById("clinical_notes").value,
            });

            result.value = data.message || "EMR created";
            form.reset();
            toast("EMR created");
        } catch (error) {
            result.value = error.message;
        }
    });
});