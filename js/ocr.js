const selectedMachine =
    JSON.parse(localStorage.getItem("selectedMachine"));

const expectedPart =
    selectedMachine.expected_part;

// Display expected part
document.getElementById("expectedPartBox").innerHTML = `
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

    // Check image selected
    if (!imageInput.files.length) {

        alert("Please upload image");
        return;
    }

    loadingText.innerHTML =
        "Processing OCR... Please wait";

    ocrResult.innerHTML = "";

    const imageFile =
        imageInput.files[0];

    // Create image object
    const image = new Image();

    image.src =
        URL.createObjectURL(imageFile);

    image.onload = async function () {

        // Create canvas
        const canvas =
            document.createElement("canvas");

        const ctx =
            canvas.getContext("2d");

        canvas.width = image.width;
        canvas.height = image.height;

        // Draw image on canvas
        ctx.drawImage(image, 0, 0);

        try {

            // OCR PROCESS
            const result =
                await Tesseract.recognize(
                    canvas,
                    "eng"
                );

            const extractedText =
                result.data.text;

            console.log("OCR TEXT:");
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
                    .toUpperCase()
                    .replace(/O/g, "0")
                    .replace(/I/g, "1")
                    .replace(/S/g, "5")
                    .replace(/B/g, "8");

            console.log(
                "EXPECTED:",
                normalizedExpected
            );

            // Split OCR lines
            const lines =
                extractedText.split("\n");

            let detectedPart = "";

            // Search all OCR lines
            for (const line of lines) {

                const upperLine =
                    line.toUpperCase();

                console.log(
                    "CHECKING LINE:",
                    upperLine
                );

                // PRIORITY 1 → WHT codes
                const whtMatch =
                    upperLine.match(
                        /WHT[0-9A-Z]{5,15}/g
                    );

                if (whtMatch) {

                    detectedPart =
                        whtMatch[0]
                            .replace(/\s/g, "");

                    console.log(
                        "WHT MATCH:",
                        detectedPart
                    );

                    break;
                }

                // PRIORITY 2 → N codes
                const nMatch =
                    upperLine.match(
                        /N[0-9]{5,15}/g
                    );

                if (nMatch) {

                    detectedPart =
                        nMatch[0]
                            .replace(/\s/g, "");

                    console.log(
                        "N MATCH:",
                        detectedPart
                    );

                    break;
                }
            }

            // Normalize detected part
            detectedPart =
                detectedPart
                    .replace(/O/g, "0")
                    .replace(/I/g, "1")
                    .replace(/S/g, "5")
                    .replace(/B/g, "8");

            console.log(
                "DETECTED:",
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

                const detectedChar =
                    detectedPart[i];

                const expectedChar =
                    normalizedExpected[i];

                // Exact match
                if (
                    detectedChar === expectedChar
                ) {

                    matchedChars++;
                }

                // OCR tolerance
                else if (

                    (
                        detectedChar === "3" &&
                        expectedChar === "8"
                    )

                    ||

                    (
                        detectedChar === "8" &&
                        expectedChar === "3"
                    )

                    ||

                    (
                        detectedChar === "0" &&
                        expectedChar === "O"
                    )

                    ||

                    (
                        detectedChar === "O" &&
                        expectedChar === "0"
                    )

                ) {

                    matchedChars += 0.8;
                }
            }

            const similarity =
                matchedChars /
                normalizedExpected.length;

            console.log(
                "SIMILARITY:",
                similarity
            );

            // Final decision
            const isMatched =
                similarity >= 0.75;

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

        } catch (error) {

            console.error(error);

            loadingText.innerHTML = "";

            ocrResult.innerHTML = `
                <div class="error-box">
                    <h2>OCR ERROR</h2>
                    <p>
                        Failed to process image
                    </p>
                </div>
            `;
        }
    };
}