document.addEventListener("DOMContentLoaded", loadRecords);

async function loadRecords() {
    const status = document.getElementById("status");
    const container = document.getElementById("appointmentContainer");

    status.textContent = "Loading...";
    container.innerHTML = "";

    try {
        const appointments = await getJSON("/loaddata/userappointmentlist");

        status.textContent = `Loaded ${appointments.length} record(s).`;

        appointments.forEach((appointment) => {
            const card = document.createElement("div");
            card.className = "card filter-card";

            card.innerHTML = `
                <h3>Appointment #${safe(appointment.appointment_id)}</h3>
                <div><b>Doctor:</b> ${safe(appointment.doctor_name)}</div>
                <div><b>Specialization:</b> ${safe(appointment.specialization)}</div>
                <div><b>Date:</b> ${safe(appointment.appointment_date)}</div>
                <div><b>Time:</b> ${safe(appointment.appointment_time)}</div>
                <div><b>Reason:</b> ${safe(appointment.reason)}</div>
                <div><b>Status:</b> ${badge(appointment.request_status)}</div>

                <a class="btn-blue" style="margin-top:12px;" onclick="setAppointment('${appointment.appointment_id}')" href="patient_chat.html">
                    Open Chat
                </a>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        status.innerHTML = `<span class="error">${error.message}</span>`;
    }
}
