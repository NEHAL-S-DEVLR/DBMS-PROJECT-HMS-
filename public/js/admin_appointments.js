document.addEventListener("DOMContentLoaded", loadAppointments);

document.addEventListener("change", async (event) => {
    if (!event.target.matches('input[type="radio"]')) {
        return;
    }

    const wrapper = event.target.closest(".statusForm");

    if (!wrapper) {
        return;
    }

    try {
        await postJSON("/request/docupdatestatus", {
            appointment_id: wrapper.dataset.id,
            status: event.target.value,
        });

        document.getElementById("s" + wrapper.dataset.id).innerHTML = badge(event.target.value);

        toast("Status updated");
    } catch (error) {
        alert(error.message);
        loadAppointments();
    }
});

async function loadAppointments() {
    const status = document.getElementById("status");
    const container = document.getElementById("appointmentContainer");

    status.textContent = "Loading appointments...";
    container.innerHTML = "";

    try {
        const appointments = await getJSON("/loaddata/appointmentlist");

        status.textContent = `Loaded ${appointments.length} appointment(s).`;

        appointments.forEach((appointment) => {
            const card = document.createElement("div");
            card.className = "card filter-card";

            card.innerHTML = `
                <h3>Appointment #${safe(appointment.appointment_id)}</h3>
                <div><b>Patient:</b> ${safe(appointment.patient_name)}</div>
                <div><b>Doctor:</b> ${safe(appointment.doctor_name)}</div>
                <div><b>Date:</b> ${safe(appointment.appointment_date)}</div>
                <div><b>Time:</b> ${safe(appointment.appointment_time)}</div>
                <div><b>Reason:</b> ${safe(appointment.reason)}</div>
                <div>
                    <b>Status:</b>
                    <span id="s${appointment.appointment_id}">
                        ${badge(appointment.request_status)}
                    </span>
                </div>

                <div class="statusForm" data-id="${appointment.appointment_id}">
                    <label><input type="radio" name="st${appointment.appointment_id}" value="pending" ${appointment.request_status === "pending" ? "checked" : ""}> Pending</label>
                    <label><input type="radio" name="st${appointment.appointment_id}" value="confirmed" ${appointment.request_status === "confirmed" ? "checked" : ""}> Confirmed</label>
                    <label><input type="radio" name="st${appointment.appointment_id}" value="declined" ${appointment.request_status === "declined" ? "checked" : ""}> Declined</label>
                    <label><input type="radio" name="st${appointment.appointment_id}" value="completed" ${appointment.request_status === "completed" ? "checked" : ""}> Completed</label>
                </div>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        status.innerHTML = `<span class="error">${error.message}</span>`;
    }
}
