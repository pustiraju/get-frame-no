 const dropZone = document.getElementById("dropZone");
            const fileInput = document.getElementById("fileInput");
            const dropText = document.getElementById("dropText");
            const previewImg = document.getElementById("previewImg");
            const result = document.getElementById("result");
            const allData = document.getElementById("alltext");
            const autoCopyBtn = document.getElementById("autoCopyBtn");
            const loader = document.getElementById("loader");

            let selectedFile = null;
            let autoCopy = false;

          
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
                    previewImg.classList.remove("hidden");
                    dropText.classList.add("hidden");
                };
                reader.readAsDataURL(file);

                uploadImage();
            }

            async function uploadImage() {
                if (!selectedFile) return;

                loader.classList.remove("hidden"); 
                result.innerText = "";

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

                   
                    if (autoCopy && frameNo !== "Not found") {
                        await navigator.clipboard.writeText(frameNo);
                        console.log(`Copied to clipboard: ${frameNo}`);
                        result.innerText = "Copied!";
                    }
                } catch (err) {
                    console.error(err);
                    alert("Error extracting Frame No");
                } finally {
                    loader.classList.add("hidden");
                }
            }

            dropZone.addEventListener("click", () => {
                fileInput.value = null;
                fileInput.click();
            });

            
            fileInput.addEventListener("change", (e) => {
                if (e.target.files.length > 0) 
                    handleFile(e.target.files[0]);
                }
            );

            // dragdrop
            dropZone.addEventListener("dragover", (e) => {
                e.preventDefault();
                dropZone.classList.add("border-blue-500", "text-blue-500", "bg-blue-50");
            });

            dropZone.addEventListener("dragleave", () => {
                dropZone.classList.remove("border-blue-500", "text-blue-500", "bg-blue-50");
            });

            dropZone.addEventListener("drop", (e) => {
                e.preventDefault();
                dropZone.classList.remove("border-blue-500", "text-blue-500", "bg-blue-50");
                if (e.dataTransfer.files.length > 0) 
                    handleFile(e.dataTransfer.files[0]);
                }
            );

            // auto copy 
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