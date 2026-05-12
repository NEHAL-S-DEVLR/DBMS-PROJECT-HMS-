document.addEventListener("DOMContentLoaded", () => {
    appointment_id.value = localStorage.getItem("appointment_id") || "";

    prescriptionForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
            const data = await postJSON("/medical/prescription", {
                appointment_id: appointment_id.value,
                medicine_name: medicine_name.value,
                dosage: dosage.value,
                duration_days: duration_days.value,
                notes: notes.value,
            });

            result.value = data.message || "Prescription created";
            prescriptionForm.reset();
            toast("Prescription created");
        } catch (error) {
            result.value = error.message;
        }
    });
});
