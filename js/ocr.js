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

    // Create image
    const image = new Image();

    image.src =
        URL.createObjectURL(imageFile);

    image.onload = async function () {

        // Canvas
        const canvas =
            document.createElement("canvas");

        const ctx =
            canvas.getContext("2d");

        canvas.width = image.width;
        canvas.height = image.height;

        ctx.drawImage(image, 0, 0);

        // OCR
        const result =
            await Tesseract.recognize(
                canvas,
                "eng"
            );

        const extractedText =
            result.data.text;

        console.log(extractedText);

        // Show OCR text
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

        // Normalize expected part
        const normalizedExpected =
            expectedPart
                .replace(/\s/g, "")
                .toUpperCase();

        // Split lines
        const lines =
            extractedText.split("\n");

        let detectedPart = "";

        // Search keyword line
        for (let i = 0; i < lines.length; i++) {

            const currentLine =
                lines[i]
                    .toUpperCase();

            // Find Kundenteile line
            if (
                currentLine.includes("KUND") ||
                currentLine.includes("DENTE")
            ) {

                // Take NEXT line
                if (lines[i + 1]) {

                    detectedPart =
                        lines[i + 1]
                            .replace(/\s/g, "")
                            .toUpperCase();

                    break;
                }
            }
        }

        // OCR correction
        detectedPart =
            detectedPart
                .replace(/O/g, "0")
                .replace(/I/g, "1")
                .replace(/S/g, "5")
                .replace(/B/g, "8");

        console.log(
            "Detected:",
            detectedPart
        );

        // Similarity check
        let matchedChars = 0;

        for (
            let i = 0;
            i < Math.min(
                detectedPart.length,
                normalizedExpected.length
            );
            i++
        ) {

            if (
                detectedPart[i] ===
                normalizedExpected[i]
            ) {

                matchedChars++;
            }
        }

        const similarity =
            matchedChars /
            normalizedExpected.length;

        console.log(
            "Similarity:",
            similarity
        );

        const isMatched =
            similarity >= 0.5;

        loadingText.innerHTML = "";

        // SUCCESS
        if (isMatched) {

            ocrResult.innerHTML += `
                <div class="success-box">
                    <h2>CORRECT STUD</h2>

                    <p>
                        Expected:
                        ${expectedPart}
                    </p>

                    <p>
                        Detected:
                        ${detectedPart}
                    </p>

                    <p>
                        Similarity:
                        ${(similarity * 100).toFixed(0)}%
                    </p>
                </div>
            `;

        }

        // FAILURE
        else {

            ocrResult.innerHTML += `
                <div class="error-box">
                    <h2>WRONG STUD</h2>

                    <p>
                        Expected:
                        ${expectedPart}
                    </p>

                    <p>
                        Detected:
                        ${detectedPart || "No Match"}
                    </p>

                    <p>
                        Similarity:
                        ${(similarity * 100).toFixed(0)}%
                    </p>
                </div>
            `;
        }
    };
}