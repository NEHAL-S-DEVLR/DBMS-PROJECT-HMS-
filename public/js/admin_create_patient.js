document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("patientForm");
    const result = document.getElementById("result");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const patientName = document.getElementById("pname").value.trim();
        const emailValue = document.getElementById("email").value.trim();
        const passwordValue = document.getElementById("password").value.trim();
        const confirmPasswordValue = document.getElementById("confirmPassword").value.trim();
        const phoneValue = document.getElementById("phone").value.trim();
        const dobValue = document.getElementById("dob").value;
        const genderValue = document.getElementById("gender").value;

        if (
            !patientName ||
            !emailValue ||
            !passwordValue ||
            !confirmPasswordValue ||
            !phoneValue ||
            !dobValue ||
            !genderValue
        ) {
            result.value = "All fields are required";
            return;
        }

        if (passwordValue !== confirmPasswordValue) {
            result.value = "Passwords do not match";
            return;
        }

        try {
            const data = await postJSON("/signup/patient", {
                name: patientName,
                email: emailValue,
                password: passwordValue,
                phone_no: phoneValue,
                dob: dobValue,
                gender: genderValue,
            });

            result.value = data.message || "Patient created";
            form.reset();
            toast("Patient created");
        } catch (error) {
            result.value = error.message;
        }
    });
});