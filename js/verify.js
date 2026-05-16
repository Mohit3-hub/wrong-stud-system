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

    if (!imageInput.files.length) {

        alert("Please upload image");
        return;
    }

    loadingText.innerHTML =
        "Processing OCR... Please wait";

    ocrResult.innerHTML = "";

    const imageFile =
        imageInput.files[0];

    const image = new Image();

    image.src =
        URL.createObjectURL(imageFile);

    image.onload = async function () {

        const canvas =
            document.createElement("canvas");

        const ctx =
            canvas.getContext("2d");

        canvas.width = image.width;
        canvas.height = image.height;

        ctx.drawImage(image, 0, 0);

        try {

            const result =
                await Tesseract.recognize(
                    canvas,
                    "eng"
                );

            const extractedText =
                result.data.text;

            console.log(extractedText);

            // SHOW OCR TEXT
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

            // NORMALIZE EXPECTED
            const normalizedExpected =
                normalizeText(expectedPart);

            console.log(
                "EXPECTED:",
                normalizedExpected
            );

            // FULL OCR TEXT NORMALIZED
            const normalizedOCR =
                normalizeText(extractedText);

            console.log(
                "OCR NORMALIZED:",
                normalizedOCR
            );

            // FIND WHT CODE
            let detectedPart = "";

            const whtMatch =
                normalizedOCR.match(
                    /WHT[0-9]{5,10}/
                );

            if (whtMatch) {

                detectedPart =
                    whtMatch[0];
            }

            console.log(
                "DETECTED:",
                detectedPart
            );

            // CALCULATE SIMILARITY
            const similarity =
                calculateSimilarity(
                    normalizedExpected,
                    detectedPart
                );

            console.log(
                "SIMILARITY:",
                similarity
            );

            // MATCH IF 70%+
            const isMatched =
                similarity >= 0.7;

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

            console.log(error);

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


// NORMALIZE OCR TEXT
function normalizeText(text) {

    return text
        .toUpperCase()
        .replace(/\s/g, "")
        .replace(/O/g, "0")
        .replace(/I/g, "1")
        .replace(/L/g, "1")
        .replace(/S/g, "5")
        .replace(/B/g, "8");
}


// SIMILARITY FUNCTION
function calculateSimilarity(expected, detected) {

    if (!detected) {
        return 0;
    }

    let matched = 0;

    for (
        let i = 0;
        i < Math.min(
            expected.length,
            detected.length
        );
        i++
    ) {

        const e = expected[i];
        const d = detected[i];

        // Exact
        if (e === d) {

            matched++;
        }

        // OCR tolerance
        else if (

            (e === "8" && d === "3") ||
            (e === "3" && d === "8") ||

            (e === "0" && d === "O") ||
            (e === "O" && d === "0")

        ) {

            matched += 0.8;
        }
    }

    return matched / expected.length;
}
