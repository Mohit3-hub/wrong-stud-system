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

        // Create canvas
        const canvas =
            document.createElement("canvas");

        const ctx =
            canvas.getContext("2d");

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

        for (
            let i = 0;
            i < data.length;
            i += 4
        ) {

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

        ctx.putImageData(
            imageData,
            0,
            0
        );

        // OCR PROCESS
        const result =
            await Tesseract.recognize(
                canvas,
                "eng"
            );

        const extractedText =
            result.data.text;

        console.log(extractedText);

        // Display OCR text
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
            "Expected:",
            normalizedExpected
        );

        // Split OCR lines
        const lines =
            extractedText.split("\n");

        let bestMatch = "";
        let bestSimilarity = 0;

        // Search all lines
        for (const line of lines) {

            // Remove spaces first
            const upperLine =
                line
                    .toUpperCase()
                    .replace(/\s/g, "");

            console.log(
                "Checking Line:",
                upperLine
            );

            // Extract all possible codes
            const matches =
                upperLine.match(
                    /[A-Z0-9]{5,20}/g
                );

            if (!matches) continue;

            console.log(
                "Matches:",
                matches
            );

            // Compare every detected code
            for (const part of matches) {

                // Normalize detected part
                const normalizedPart =
                    part
                        .replace(/\s/g, "")
                        .replace(/O/g, "0")
                        .replace(/I/g, "1")
                        .replace(/S/g, "5")
                        .replace(/B/g, "8");

                console.log(
                    "Normalized Part:",
                    normalizedPart
                );

                // Compare similarity
                let matchedChars = 0;

                for (
                    let i = 0;
                    i < Math.min(
                        normalizedPart.length,
                        normalizedExpected.length
                    );
                    i++
                ) {

                    if (
                        normalizedPart[i] ===
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

                // Save best match
                if (
                    similarity > bestSimilarity
                ) {

                    bestSimilarity =
                        similarity;

                    bestMatch =
                        normalizedPart;
                }
            }
        }

        console.log(
            "Best Match:",
            bestMatch
        );

        console.log(
            "Best Similarity:",
            bestSimilarity
        );

        loadingText.innerHTML = "";

        // Final decision
        const isMatched =
            bestSimilarity >= 0.5;

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
                        ${bestMatch}
                    </p>

                    <p>
                        Similarity:
                        ${(bestSimilarity * 100).toFixed(0)}%
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
                        ${bestMatch || "No Match"}
                    </p>

                    <p>
                        Similarity:
                        ${(bestSimilarity * 100).toFixed(0)}%
                    </p>
                </div>
            `;
        }
    };
}