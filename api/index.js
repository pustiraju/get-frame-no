const { TextractClient, DetectDocumentTextCommand } = require("@aws-sdk/client-textract");
const Busboy = require("busboy");

const textract = new TextractClient({ region: "ap-south-1" });

exports.handler = async (event) => {
  return new Promise((resolve) => {
    try {
      const busboy = Busboy({
        headers: event.headers,
      });

      let fileBuffer;

      busboy.on("file", (fieldname, file) => {
        const chunks = [];
        file.on("data", (chunk) => chunks.push(chunk));
        file.on("end", () => {
          fileBuffer = Buffer.concat(chunks);
        });
      });

      busboy.on("finish", async () => {
        try {
          if (!fileBuffer) throw new Error("No file uploaded.");

          // Call Textract
          const command = new DetectDocumentTextCommand({
            Document: { Bytes: fileBuffer },
          });
          const response = await textract.send(command);

          // Extract detected text
          const detectedText = response.Blocks
            .filter((b) => b.BlockType === "LINE")
            .map((b) => b.Text);

          // Try to find Frame No (example "ME4...")
          const frameNo =
            detectedText.find((line) => line && line.startsWith("ME4")) ||
            "Not found";

          resolve({
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Origin": "*", // CORS fix
              "Access-Control-Allow-Headers": "*",
            },
            body: JSON.stringify({ frameNo, allText: detectedText }),
          });
        } catch (err) {
          console.error("Error:", err);
          resolve({
            statusCode: 500,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "*",
            },
            body: JSON.stringify({ error: err.message || "Extraction failed" }),
          });
        }
      });

      // API Gateway delivers body as base64
      busboy.end(Buffer.from(event.body, "base64"));
    } catch (err) {
      console.error("Busboy setup error:", err);
      resolve({
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
        },
        body: JSON.stringify({ error: err.message || "Parser failed" }),
      });
    }
  });
};
