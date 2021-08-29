let passwordEncrypted = document.getElementById("passwordEncrypted");
let passwordInput = document.getElementById("passwordInput");

function updateEncrypted() {
    passwordEncrypted.value = CryptoJS.MD5(passwordInput.value);
}

passwordInput.addEventListener("input", updateEncrypted);