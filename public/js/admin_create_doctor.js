document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("docForm");
    const result = document.getElementById("result");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const doctorName = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();
        const specialization = document.getElementById("specialization").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const dob = document.getElementById("dob").value;
        const gender = document.getElementById("gender").value;

        if (
            !doctorName ||
            !email ||
            !password ||
            !confirmPassword ||
            !specialization ||
            !phone ||
            !dob ||
            !gender
        ) {
            result.value = "All fields are required";
            return;
        }

        if (password !== confirmPassword) {
            result.value = "Passwords do not match";
            return;
        }

        try {
            const response = await fetch("/signup/doc", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: doctorName,
                    email,
                    password,
                    phone_no: phone,
                    dob,
                    gender,
                    specialization,
                }),
            });

            const data = await response.json();

            result.value = data.message || "Request completed";

            if (response.ok) {
                form.reset();
                toast("Doctor created");
            }
        } catch (error) {
            result.value = "Failed to create doctor";
            console.error(error);
        }
    });
});
