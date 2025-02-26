function showAlert(message) {
    const modal = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.textContent = message;
    modal.style.display = 'flex';
    setTimeout(() => {
        closeAlert();
    }, 1750);
}

function closeAlert() {
    const modal = document.getElementById('customAlert');
    modal.style.display = 'none';
}

function showPrompt(message, callback) {
    const modal = document.getElementById('customPrompt');
    const promptMessage = document.getElementById('promptMessage');
    promptMessage.textContent = message;
    modal.style.display = 'flex'; // Use 'flex' for centering
    window.promptCallback = callback; // Store callback globally
}

function submitPrompt() {
    const input = document.getElementById('promptInput').value;
    closePrompt();
    if (window.promptCallback) {
        window.promptCallback(input);
    }
}

function closePrompt() {
    const modal = document.getElementById('customPrompt');
    modal.style.display = 'none';
    document.getElementById('promptInput').value = '';
}