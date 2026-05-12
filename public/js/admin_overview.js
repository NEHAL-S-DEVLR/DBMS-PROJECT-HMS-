document.addEventListener("DOMContentLoaded", async () => {
    try {
        const doctors = await getJSON("/loaddata/doctorlist");
        doctorCount.textContent = doctors.length;
    } catch (error) {
        doctorCount.textContent = "0";
    }

    try {
        const patients = await getJSON("/loaddata/patientlist");
        patientCount.textContent = patients.length;
    } catch (error) {
        patientCount.textContent = "0";
    }

    try {
        const appointments = await getJSON("/loaddata/appointmentlist");
        appointmentCount.textContent = appointments.length;
    } catch (error) {
        appointmentCount.textContent = "0";
    }

    try {
        const bills = await getJSON("/advanced/billing");
        const total = bills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
        revenueCount.textContent = money(total);
    } catch (error) {
        revenueCount.textContent = "₹0";
    }
});
