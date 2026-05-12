const $ = (id) => document.getElementById(id);

const safe = (value) => value ?? "N/A";

const money = (value) => {
    return "₹" + Number(value || 0).toLocaleString("en-IN");
};

function badge(status) {
    const value = status || "pending";
    return `<span class="badge badge-${value}">${value}</span>`;
}

function toast(message) {
    const toastBox = $("toast");

    if (!toastBox) {
        return;
    }

    toastBox.textContent = message;
    toastBox.classList.add("show");

    setTimeout(() => {
        toastBox.classList.remove("show");
    }, 2600);
}

async function getJSON(url) {
    const response = await fetch(url);
    const text = await response.text();

    let data;

    try {
        data = JSON.parse(text);
    } catch (error) {
        throw new Error("Backend route not connected: " + url);
    }

    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

async function postJSON(url, body) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const text = await response.text();

    let data;

    try {
        data = JSON.parse(text);
    } catch (error) {
        throw new Error("Backend route not connected: " + url);
    }

    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

async function deleteJSON(url) {
    const response = await fetch(url, {
        method: "DELETE",
    });

    const text = await response.text();

    let data;

    try {
        data = JSON.parse(text);
    } catch (error) {
        throw new Error("Backend route not connected: " + url);
    }

    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

function setAppointment(id) {
    localStorage.setItem("appointment_id", id);
}

function filterCards() {
    const query = ($("globalSearch")?.value || "").toLowerCase();

    document.querySelectorAll(".filter-card").forEach((card) => {
        const isMatch = card.textContent.toLowerCase().includes(query);
        card.style.display = isMatch ? "block" : "none";
    });
}
