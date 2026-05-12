document.addEventListener("DOMContentLoaded", () => {
    loadDoctors();

    const form = document.getElementById("reqappointment");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const selectedDoctorId = document.getElementById("selectedDoctorId");
        const date = document.getElementById("date");
        const category = document.getElementById("category");
        const textInput = document.getElementById("textInput");
        const formMessage = document.getElementById("formMessage");

        if (!selectedDoctorId.value) {
            formMessage.innerHTML = '<span class="error">Please select a doctor</span>';
            return;
        }

        try {
            const data = await postJSON("/request/reqappointment", {
                doctor_id: selectedDoctorId.value,
                date: date.value,
                category: category.value,
                textInput: textInput.value,
            });

            formMessage.innerHTML = `
                <span class="success">
                    ${data.message || "Appointment requested"}
                </span>
            `;

            form.reset();
            selectedDoctorId.value = "";

            toast("Appointment requested");
        } catch (error) {
            formMessage.innerHTML = `<span class="error">${error.message}</span>`;
        }
    });
});

async function loadDoctors() {
    const status = document.getElementById("status");
    const doctorContainer = document.getElementById("doctorContainer");
    const selectedDoctorId = document.getElementById("selectedDoctorId");

    status.textContent = "Loading doctors...";
    doctorContainer.innerHTML = "";

    try {
        const doctors = await getJSON("/loaddata/doctorlist");

        status.textContent = `Loaded ${doctors.length} doctor(s).`;

        doctors.forEach((doctor) => {
            const card = document.createElement("div");
            card.className = "doctor-card filter-card";

            card.innerHTML = `
                <h3>${safe(doctor.name)}</h3>
                <p>${badge("active")} ${safe(doctor.specialization)}</p>
                <div><b>Email:</b> ${safe(doctor.email)}</div>
                <div><b>Phone:</b> ${safe(doctor.phone_no)}</div>
            `;

            card.addEventListener("click", () => {
                document.querySelectorAll(".doctor-card").forEach((item) => {
                    item.classList.remove("selected");
                });

                card.classList.add("selected");
                selectedDoctorId.value = doctor.user_id;
            });

            doctorContainer.appendChild(card);
        });
    } catch (error) {
        status.innerHTML = `<span class="error">${error.message}</span>`;
    }
}
