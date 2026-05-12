let currentUserRole = "";
let currentUserName = "";
let autoRefreshTimer = null;

document.addEventListener("DOMContentLoaded", async () => {
    appointment_id.value = localStorage.getItem("appointment_id") || "";

    await loadCurrentUser();

    if (appointment_id.value) {
        await loadMessages();
        startAutoRefresh();
    }

    message_text.addEventListener("keydown", async (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            await sendMessage();
        }
    });

    appointment_id.addEventListener("change", async () => {
        localStorage.setItem("appointment_id", appointment_id.value);

        await loadMessages();
        startAutoRefresh();
    });
});

async function loadCurrentUser() {
    try {
        const profile = await getJSON("/loaddata/userprofile");

        currentUserRole = profile.role || "";
        currentUserName = profile.name || "Me";

        if (document.getElementById("currentUserLabel")) {
            currentUserLabel.textContent = `${currentUserName} · ${currentUserRole}`;
        }
    } catch (error) {
        chatStatus.innerHTML = `<span class="error">${error.message}</span>`;
    }
}

function startAutoRefresh() {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
    }

    autoRefreshTimer = setInterval(async () => {
        if (appointment_id.value) {
            await loadMessages(false);
        }
    }, 4000);
}

async function loadMessages(showLoading = true) {
    if (!appointment_id.value) {
        chatStatus.innerHTML = `<span class="error">Enter appointment ID first.</span>`;
        chatBox.innerHTML = `
            <div class="chat-empty">
                Select an appointment chat or enter an appointment ID to see messages.
            </div>
        `;
        return;
    }

    if (showLoading) {
        chatStatus.textContent = "Loading messages...";
    }

    try {
        const messages = await getJSON(
            `/loaddata/loadmessages?appointment_id=${encodeURIComponent(appointment_id.value)}`
        );

        chatStatus.textContent = `Showing ${messages.length} message(s) for appointment #${appointment_id.value}.`;
        chatBox.innerHTML = "";

        if (messages.length === 0) {
            chatBox.innerHTML = `
                <div class="chat-empty">
                    No messages yet. Send the first message below.
                </div>
            `;
            return;
        }

        messages.forEach((message) => {
            const messageCard = document.createElement("div");
            const isMine = message.sender_role === currentUserRole;

            messageCard.className = `chat-message ${isMine ? "chat-right" : "chat-left"}`;

            messageCard.innerHTML = `
                <div class="chat-meta">
                    ${safe(message.sender_display_name)}
                    ·
                    ${safe(message.sender_role)}
                    ·
                    ${formatDate(message.sent_at)}
                </div>
                <div>${escapeHTML(message.message_text)}</div>
            `;

            chatBox.appendChild(messageCard);
        });

        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        chatStatus.innerHTML = `<span class="error">${error.message}</span>`;
    }
}

async function sendMessage() {
    if (!appointment_id.value || !message_text.value.trim()) {
        chatStatus.innerHTML = `<span class="error">Appointment ID and message are required.</span>`;
        return;
    }

    try {
        const data = await postJSON("/request/sendmessage", {
            appointment_id: appointment_id.value,
            message_text: message_text.value,
        });

        message_text.value = "";
        toast(data.message || "Message sent");

        await loadMessages(false);
    } catch (error) {
        chatStatus.innerHTML = `<span class="error">${error.message}</span>`;
    }
}

async function deleteChat() {
    if (!appointment_id.value) {
        chatStatus.innerHTML = `<span class="error">Enter appointment ID first.</span>`;
        return;
    }

    const confirmed = confirm("Delete all messages for this appointment?");

    if (!confirmed) {
        return;
    }

    try {
        const data = await deleteJSON(
            `/request/deletechat?appointment_id=${encodeURIComponent(appointment_id.value)}`
        );

        toast(data.message || "Chat deleted");

        await loadMessages(false);
    } catch (error) {
        chatStatus.innerHTML = `<span class="error">${error.message}</span>`;
    }
}

function formatDate(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString();
}

function escapeHTML(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
