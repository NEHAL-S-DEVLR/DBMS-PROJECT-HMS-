document.addEventListener("DOMContentLoaded", loadRecords);

document.addEventListener("change", async (event) => {
    if (!event.target.classList.contains("completeToggle")) {
        return;
    }

    const appointmentId = event.target.dataset.id;
    const statusValue = event.target.checked ? "completed" : "confirmed";

    try {
        await postJSON("/request/docupdatestatus", {
            appointment_id: appointmentId,
            status: statusValue,
        });

        document.getElementById("s" + appointmentId).innerHTML = badge(statusValue);

        toast("Appointment updated");
    } catch (error) {
        alert(error.message);
        event.target.checked = !event.target.checked;
    }
});

async function loadRecords() {
    const status = document.getElementById("status");
    const container = document.getElementById("appointmentContainer");

    status.textContent = "Loading appointments...";
    container.innerHTML = "";

    try {
        const appointments = await getJSON("/loaddata/userappointmentlist");

        status.textContent = `Loaded ${appointments.length} appointment(s).`;

        appointments.forEach((appointment) => {
            const card = document.createElement("div");
            card.className = "card filter-card";

            card.innerHTML = `
                <h3>Appointment #${safe(appointment.appointment_id)}</h3>
                <div><b>Patient:</b> ${safe(appointment.patient_name)}</div>
                <div><b>Date:</b> ${safe(appointment.appointment_date)}</div>
                <div><b>Time:</b> ${safe(appointment.appointment_time)}</div>
                <div><b>Reason:</b> ${safe(appointment.reason)}</div>
                <div><b>Status:</b> <span id="s${appointment.appointment_id}">${badge(appointment.request_status)}</span></div>

                <label style="display:flex; gap:10px; align-items:center; margin-top:12px;">
                    <input type="checkbox" class="completeToggle" data-id="${appointment.appointment_id}" ${appointment.request_status === "completed" ? "checked" : ""}>
                    Mark completed
                </label>

                <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;">
                    <a class="btn-outline" onclick="setAppointment('${appointment.appointment_id}')" href="doctor_prescriptions.html">Prescribe</a>
                    <a class="btn-outline" onclick="setAppointment('${appointment.appointment_id}')" href="doctor_emr.html">Add EMR</a>
                    <a class="btn-blue" onclick="setAppointment('${appointment.appointment_id}')" href="doctor_chat.html">Chat</a>
                </div>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        status.innerHTML = `<span class="error">${error.message}</span>`;
    }
}
