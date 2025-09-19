
            const dropZone = document.getElementById("dropZone");
            const fileInput = document.getElementById("fileInput");
            const dropText = document.getElementById("dropText");
            const previewImg = document.getElementById("previewImg");
            const result = document.getElementById("result");
            const allData = document.getElementById("alltext");
            const autoCopyBtn = document.getElementById("autoCopyBtn");

            let selectedFile = null;
            let autoCopy = false;

            // Toggle auto-copy
            autoCopyBtn.addEventListener("click", () => {
                autoCopy = !autoCopy;
                autoCopyBtn.innerText = `Auto Copy: ${autoCopy
                    ? "ON"
                    : "OFF"}`;
                autoCopyBtn
                    .classList
                    .toggle("bg-green-400", autoCopy);
                autoCopyBtn
                    .classList
                    .toggle("bg-gray-300", !autoCopy);
            });

            function handleFile(file) {
                selectedFile = file;

                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImg.src = e.target.result;
                    previewImg
                        .classList
                        .remove("hidden");
                    dropText
                        .classList
                        .add("hidden");
                };
                reader.readAsDataURL(file);

                uploadImage();
            }

            async function uploadImage() {
                if (!selectedFile) 
                    return;
                
                const formData = new FormData();
                formData.append("image", selectedFile);

                try {
                    const response = await fetch(
                        "https://m605ue3bva.execute-api.ap-south-1.amazonaws.com/get-frame-no",
                        {
                            method: "POST",
                            body: formData
                        }
                    );

                    const data = await response.json();
                    allData.innerText = JSON.stringify(data);
                    const frameNo = data.frameNo || "Not found";
                    result.innerText = frameNo;

                    // Auto copy if enabled
                    if (autoCopy && frameNo !== "Not found") {
                        await navigator
                            .clipboard
                            .writeText(frameNo);
                        console.log(`Copied to clipboard: ${frameNo}`);

                        // Change background color temporarily
                        result
                            .classList
                            .add("bg-green-600");
                        setTimeout(() => {
                            result
                                .classList
                                .remove("bg-green-600");
                        }, 1000); // 1 second
                    }
                } catch (err) {
                    console.error(err);
                    alert("Error extracting Frame No");
                }
            }

            // Click to open file selector (reset before click)
            dropZone.addEventListener("click", () => {
                fileInput.value = null; // reset input
                fileInput.click();
            });

            // Handle file input change
            fileInput.addEventListener("change", (e) => {
                if (e.target.files.length > 0) 
                    handleFile(e.target.files[0]);
                }
            );

            // Drag & drop
            dropZone.addEventListener("dragover", (e) => {
                e.preventDefault();
                dropZone
                    .classList
                    .add("border-blue-500", "text-blue-500", "bg-blue-50");
            });

            dropZone.addEventListener("dragleave", () => {
                dropZone
                    .classList
                    .remove("border-blue-500", "text-blue-500", "bg-blue-50");
            });

            dropZone.addEventListener("drop", (e) => {
                e.preventDefault();
                dropZone
                    .classList
                    .remove("border-blue-500", "text-blue-500", "bg-blue-50");
                if (e.dataTransfer.files.length > 0) 
                    handleFile(e.dataTransfer.files[0]);
                }
            );
            // Copy to clipboard on result click
             function copyToClipboard() {
                const text = result.innerText;
                if (text && text !== "Not found") {
                    try {
                         navigator.clipboard.writeText(text);
                        result.innerText = "Copied!";
                    } catch (err) {
                        console.error("Failed to copy: ", err);
                    }
                }
            }   
