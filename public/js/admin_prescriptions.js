document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("prescriptionForm");
    const result = document.getElementById("result");
    const appointmentId = document.getElementById("appointment_id");

    appointmentId.value = localStorage.getItem("appointment_id") || "";

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
            const data = await postJSON("/medical/prescription", {
                appointment_id: appointmentId.value,
                medicine_name: document.getElementById("medicine_name").value,
                dosage: document.getElementById("dosage").value,
                duration_days: document.getElementById("duration_days").value,
                notes: document.getElementById("notes").value,
            });

            result.value = data.message || "Prescription created";
            form.reset();
            toast("Prescription created");
        } catch (error) {
            result.value = error.message;
        }
    });
});
