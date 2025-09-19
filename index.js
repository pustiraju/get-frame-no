import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";
import busboy from "busboy";

const textract = new TextractClient({ region: "ap-south-1" });

export const handler = async (event) => {
  try {
    // Decode multipart form-data (file upload)
    const contentType = event.headers["content-type"] || event.headers["Content-Type"];
    const bb = busboy({ headers: { "content-type": contentType } });

    const fileBuffer = await new Promise((resolve, reject) => {
      let buffer;
      bb.on("file", (name, file) => {
        const chunks = [];
        file.on("data", (chunk) => chunks.push(chunk));
        file.on("end", () => {
          buffer = Buffer.concat(chunks);
        });
      });
      bb.on("finish", () => resolve(buffer));
      bb.on("error", reject);
      bb.end(Buffer.from(event.body, "base64")); // API Gateway sends base64
    });

    // Call Textract
    const command = new DetectDocumentTextCommand({
      Document: { Bytes: fileBuffer },
    });

    const response = await textract.send(command);

    const detectedText = response.Blocks
      .filter((b) => b.BlockType === "LINE")
      .map((b) => b.Text);

    const frameNo = detectedText.find((line) => line.startsWith("ME4")) || "Not found";

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // allow frontend
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ frameNo, allText: detectedText }),
    };
  } catch (err) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Extraction failed" }),
    };
  }
};
