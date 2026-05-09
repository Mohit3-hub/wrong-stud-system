const selectedMachine =
    JSON.parse(localStorage.getItem("selectedMachine"));

const expectedPart =
    selectedMachine.expected_part;

// Display expected part
document.getElementById("expectedPartBox")
.innerHTML = `
    <h3>Expected Part</h3>
    <p>${expectedPart}</p>
`;

async function verifyStud() {

    const imageInput =
        document.getElementById("imageInput");

    const loadingText =
        document.getElementById("loadingText");

    const ocrResult =
        document.getElementById("ocrResult");

    if (!imageInput.files.length) {

        alert("Please upload image");

        return;
    }

    loadingText.innerHTML =
        "Processing OCR... Please wait";

    ocrResult.innerHTML = "";

    const imageFile =
        imageInput.files[0];

    // OCR Processing
    const result =
        await Tesseract.recognize(
            imageFile,
            "eng"
        );

    const extractedText =
        result.data.text;

    console.log(extractedText);

    // Normalize text
    const normalizedText =
        extractedText
            .replace(/\s/g, "")
            .toUpperCase();

    const normalizedExpected =
        expectedPart
            .replace(/\s/g, "")
            .toUpperCase();

    // Compare
    const isMatched =
        normalizedText.includes(normalizedExpected);

    loadingText.innerHTML = "";

    if (isMatched) {

        ocrResult.innerHTML = `
            <div class="success-box">
                <h2>CORRECT STUD</h2>
                <p>${expectedPart}</p>
            </div>
        `;

    } else {

        ocrResult.innerHTML = `
            <div class="error-box">
                <h2>WRONG STUD</h2>
                <p>Expected:
                ${expectedPart}</p>
            </div>
        `;
    }
}
