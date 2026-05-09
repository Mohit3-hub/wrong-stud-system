async function verifyMachine() {

    const machineId = document
        .getElementById("machineId")
        .value
        .trim()
        .toUpperCase();

    const machineInfo = document.getElementById("machineInfo");

    const machineError = document.getElementById("machineError");

    machineInfo.innerHTML = "";
    machineError.innerHTML = "";

    if (machineId === "") {

        machineError.innerText =
            "Please enter machine ID";

        return;
    }

    // Load machine database
    const response = await fetch("../json/machines.json");

    const machines = await response.json();

    // Find machine
    const selectedMachine = machines.find(
        machine => machine.machine_qr === machineId
    );

    if (!selectedMachine) {

        machineError.innerText =
            "Machine not found";

        return;
    }

    // Save selected machine
    localStorage.setItem(
        "selectedMachine",
        JSON.stringify(selectedMachine)
    );

    // Display machine info
    machineInfo.innerHTML = `
        <h3>Machine Verified</h3>

        <p><strong>Area:</strong>
        ${selectedMachine.area}</p>

        <p><strong>Tucker:</strong>
        ${selectedMachine.tucker_no}</p>

        <p><strong>Expected Part:</strong>
        ${selectedMachine.expected_part}</p>

        <button class="btn continue-button"
            onclick="continueToVerification()">
            CONTINUE
        </button>
    `;
}

// Continue button
function continueToVerification() {

    window.location.href =
        "stud-verify.html";
}
