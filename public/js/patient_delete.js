document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("deleteForm");
    const result = document.getElementById("result");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const emailValue = document.getElementById("email").value.trim();
        const passwordValue = document.getElementById("password").value.trim();
        const confirmPasswordValue = document.getElementById("confirmPassword").value.trim();

        if (!emailValue || !passwordValue || !confirmPasswordValue) {
            result.value = "All fields are required";
            return;
        }

        if (passwordValue !== confirmPasswordValue) {
            result.value = "Passwords do not match";
            return;
        }

        try {
            const data = await postJSON("/request/deleteaccount", {
                email: emailValue,
                password: passwordValue,
                confirmPassword: confirmPasswordValue,
            });

            result.value = data.message || "Account deactivated";
            toast("Account deactivated");

            setTimeout(() => {
                location.href = "../index.html";
            }, 1000);
        } catch (error) {
            result.value = error.message;
        }
    });
});