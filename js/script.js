document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();


    let email = document.getElementById("email").value;
    let phone = document.getElementById("phone").value;
    let password = document.getElementById("password").value;

   
    if (email === "admin@example.com" && phone === "9876543210" && password === "1919") {
        alert("Login successful!");
        window.location.href = "index.html"; 
    } else {
        alert("Invalid email, phone number, or password. Try again.");
    }
});