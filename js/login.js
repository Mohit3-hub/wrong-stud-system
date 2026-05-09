function loginOperator() {

    const employeeId = document
        .getElementById("employeeId")
        .value
        .trim();

    const errorMessage = document.getElementById("errorMessage");

    if (employeeId === "") {

        errorMessage.innerText = "Please enter Employee ID";
        return;
    }

    // Save login session
    localStorage.setItem("employeeId", employeeId);

    // Redirect to home screen
    window.location.href = "home.html";
}
