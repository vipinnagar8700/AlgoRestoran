// Function to get the token from localStorage
function getTokenFromLocalStorage() {
    return localStorage.getItem('token');
}

// Function to update the UI with the token
function updateTokenDisplay() {
    const token = getTokenFromLocalStorage();
    const tokenDisplay = document.getElementById('tokenDisplay');

    if (token && tokenDisplay) {
        tokenDisplay.textContent = `Token: ${token}`;
    } else {
        // Handle the case where the token is not available
        console.log('Token not found');
    }
}

// Call the function to update the UI with the token when the page loads
document.addEventListener('DOMContentLoaded', updateTokenDisplay);
