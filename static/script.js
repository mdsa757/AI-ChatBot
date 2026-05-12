// script.js — AI Chatbot frontend logic
// All user content is set via innerText only. XSS prevention enforced.

// ── DOM References ────────────────────────────────────────────────────────────
const chatWindow = document.getElementById("chat-window");
const userInput  = document.getElementById("user-input");
const sendBtn    = document.getElementById("send-btn");
const resetBtn   = document.getElementById("reset-btn");
const loadingIndicator = document.getElementById("loading-indicator");

// ── Initialise on page load ───────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Inject welcome message as first AI bubble
  appendMessage(
    "assistant",
    "Hello! I'm your AI assistant. How can I help you today?"
  );
  // Focus the input field immediately
  userInput.focus();
});

// ── Event Listeners ───────────────────────────────────────────────────────────
sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});

resetBtn.addEventListener("click", resetConversation);

// ── sendMessage ───────────────────────────────────────────────────────────────
async function sendMessage() {
  const userMessage = userInput.value.trim();

  // Guard: empty input → shake and return
  if (!userMessage) {
    shakeInput();
    return;
  }

  // Display user message immediately
  appendMessage("user", userMessage);

  // Clear input and disable controls
  userInput.value = "";
  setControlsDisabled(true);

  // Show loading indicator
  loadingIndicator.style.display = "flex";
  scrollToBottom();

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await response.json();

    // Hide loading indicator
    loadingIndicator.style.display = "none";

    if (response.ok && data.reply) {
      appendMessage("assistant", data.reply);
    } else {
      // Server returned an error body
      const errorText = data.error || "Something went wrong. Please try again.";
      appendMessage("error", errorText);
    }
  } catch (networkError) {
    // Network-level failure
    loadingIndicator.style.display = "none";
    appendMessage("error", "Network error. Please check your connection and try again.");
  } finally {
    // Re-enable controls and refocus input regardless of outcome
    setControlsDisabled(false);
    userInput.focus();
    scrollToBottom();
  }
}

// ── resetConversation ─────────────────────────────────────────────────────────
async function resetConversation() {
  try {
    const response = await fetch("/reset", { method: "POST" });

    if (response.ok) {
      // Clear all messages from the chat window
      chatWindow.innerHTML = "";

      // Re-add the loading indicator (removed when chat was cleared)
      chatWindow.appendChild(loadingIndicator);
      loadingIndicator.style.display = "none";

      // Re-inject welcome message
      appendMessage(
        "assistant",
        "Hello! I'm your AI assistant. How can I help you today?"
      );

      userInput.focus();
      scrollToBottom();
    }
    // Silent failure on reset error — do not clear chat on failure
  } catch (networkError) {
    // Silent failure — preserve conversation if reset fails
  }
}

// ── appendMessage ─────────────────────────────────────────────────────────────
function appendMessage(role, text) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");

  if (role === "user") {
    messageDiv.classList.add("user-message");
  } else if (role === "assistant") {
    messageDiv.classList.add("ai-message");
  } else if (role === "error") {
    messageDiv.classList.add("error-message");
  }

  // SECURITY: innerText only — XSS prevention
  messageDiv.innerText = text;

  // Insert before the loading indicator so it stays at the bottom
  chatWindow.insertBefore(messageDiv, loadingIndicator);

  scrollToBottom();
}

// ── setControlsDisabled ───────────────────────────────────────────────────────
function setControlsDisabled(isDisabled) {
  userInput.disabled = isDisabled;
  sendBtn.disabled   = isDisabled;
}

// ── shakeInput ────────────────────────────────────────────────────────────────
function shakeInput() {
  userInput.classList.add("input-shake");
  // Remove class after animation so it can re-trigger on repeated empty submits
  setTimeout(() => {
    userInput.classList.remove("input-shake");
  }, 320);
}

// ── scrollToBottom ────────────────────────────────────────────────────────────
function scrollToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
