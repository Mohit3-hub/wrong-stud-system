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
const image = new Image();

image.src = URL.createObjectURL(imageFile);

image.onload = async function () {

    // Create canvas
    const canvas = document.createElement("canvas");

    const ctx = canvas.getContext("2d");

    canvas.width = image.width;
    canvas.height = image.height;

    // Draw image
    ctx.drawImage(image, 0, 0);

    // Convert to grayscale
    const imageData =
        ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );

    const data = imageData.data;

for (let i = 0; i < data.length; i += 4) {

    const avg =
        (
            data[i] +
            data[i + 1] +
            data[i + 2]
        ) / 3;

    data[i] = avg;
    data[i + 1] = avg;
    data[i + 2] = avg;
}

    ctx.putImageData(imageData, 0, 0);

    // OCR
    const result =
        await Tesseract.recognize(
            canvas,
            "eng"
        );

    const extractedText =
        result.data.text;

    console.log(extractedText);

    ocrResult.innerHTML = `
        <div style="
            background:#2b313d;
            padding:20px;
            border-radius:10px;
            margin-bottom:20px;
            text-align:left;
            white-space:pre-wrap;
        ">
            <h4>OCR TEXT</h4>
            ${extractedText}
        </div>
    `;

    // Normalize
    const normalizedText =
        extractedText
            .replace(/\s/g, "")
            .toUpperCase();

    const normalizedExpected =
        expectedPart
            .replace(/\s/g, "")
            .toUpperCase();

    const isMatched =
        normalizedText.includes(normalizedExpected);

    if (isMatched) {

        ocrResult.innerHTML += `
            <div class="success-box">
                <h2>CORRECT STUD</h2>
                <p>${expectedPart}</p>
            </div>
        `;

    } else {

        ocrResult.innerHTML += `
            <div class="error-box">
                <h2>WRONG STUD</h2>
                <p>Expected:
                ${expectedPart}</p>
            </div>
        `;
    }

    loadingText.innerHTML = "";
};

    const extractedText =
        result.data.text;

    console.log(extractedText);

ocrResult.innerHTML = `
    <div style="
        background:#2b313d;
        padding:20px;
        border-radius:10px;
        margin-bottom:20px;
        text-align:left;
        white-space:pre-wrap;
    ">
        <h4>OCR TEXT</h4>
        ${extractedText}
    </div>
`;

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

        ocrResult.innerHTML += `
            <div class="success-box">
                <h2>CORRECT STUD</h2>
                <p>${expectedPart}</p>
            </div>
        `;

    } else {

        ocrResult.innerHTML += `
            <div class="error-box">
                <h2>WRONG STUD</h2>
                <p>Expected:
                ${expectedPart}</p>
            </div>
        `;
    }
}
