const selectedMachine =
    JSON.parse(localStorage.getItem("selectedMachine"));

const expectedPart =
    selectedMachine.expected_part;


// SHOW EXPECTED PART
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


    // IMAGE CHECK
    if (!imageInput.files.length) {

        alert("Please upload image");
        return;
    }


    loadingText.innerHTML =
        "Processing OCR...";

    ocrResult.innerHTML = "";


    const imageFile =
        imageInput.files[0];


    // CREATE IMAGE
    const image = new Image();

    image.src =
        URL.createObjectURL(imageFile);



    image.onload = async function () {

        // CREATE CANVAS
        const canvas =
            document.createElement("canvas");

        const ctx =
            canvas.getContext("2d");

        canvas.width =
            image.width;

        canvas.height =
            image.height;


        ctx.drawImage(
            image,
            0,
            0
        );


        try {

            // OCR
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


            // NORMALIZE OCR
            const normalizedOCR =
                extractedText
                    .toUpperCase()
                    .replace(/\s/g, "")
                    .replace(/O/g, "0")
                    .replace(/I/g, "1")
                    .replace(/L/g, "1");


            // NORMALIZE EXPECTED
            const normalizedExpected =
                expectedPart
                    .toUpperCase()
                    .replace(/\s/g, "")
                    .replace(/O/g, "0")
                    .replace(/I/g, "1")
                    .replace(/L/g, "1");


            console.log(
                "OCR:",
                normalizedOCR
            );

            console.log(
                "EXPECTED:",
                normalizedExpected
            );


            // ONLY SEARCH WHT CODE
            const detectedMatch =
                normalizedOCR.match(
                    /WHT[0-9]{5,10}/
                );


            let detectedPart = "";

            if (detectedMatch) {

                detectedPart =
                    detectedMatch[0];
            }


            console.log(
                "DETECTED:",
                detectedPart
            );


            // SIMILARITY
            let matched = 0;

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

                    matched++;
                }

                // OCR TOLERANCE
                else if (

                    (
                        detectedPart[i] === "3" &&
                        normalizedExpected[i] === "8"
                    )

                    ||

                    (
                        detectedPart[i] === "8" &&
                        normalizedExpected[i] === "3"
                    )

                ) {

                    matched += 0.8;
                }
            }


            const similarity =
                matched /
                normalizedExpected.length;


            console.log(
                "SIMILARITY:",
                similarity
            );


            // MATCH
            const isMatched =
                similarity >= 0.75;


            loadingText.innerHTML = "";


            // SUCCESS
            if (isMatched) {

                ocrResult.innerHTML += `
                    <div class="success-box">

                        <h2>
                            CORRECT STUD
                        </h2>

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

                        <h2>
                            WRONG STUD
                        </h2>

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

        }

        catch (error) {

            console.log(error);

            loadingText.innerHTML = "";

            ocrResult.innerHTML = `
                <div class="error-box">

                    <h2>
                        OCR ERROR
                    </h2>

                    <p>
                        Failed to process image
                    </p>

                </div>
            `;
        }
    };
}