document.addEventListener("DOMContentLoaded", async () => {
    const nameElement = document.getElementById("name");
    const emailElement = document.getElementById("email");
    const phoneElement = document.getElementById("phone");
    const dobElement = document.getElementById("dob");
    const genderElement = document.getElementById("gender");

    try {
        const profile = await getJSON("/loaddata/userprofile");

        nameElement.textContent = profile.name || "";
        emailElement.textContent = profile.email || "";
        phoneElement.textContent = profile.phone || "";
        dobElement.textContent = profile.dob || "";
        genderElement.textContent = profile.gender || "";
    } catch (error) {
        toast(error.message);
    }
});