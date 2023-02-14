//DefaultEndpointsProtocol=https;AccountName=stgehspocdev001;AccountKey=iQNOMLkgOGfkn8tLNjWarxkhcrvdCKaoKZOmRQI34Sx/ZuQv3j8/C6TkZPqVKlTyxi3WbBrUu4bQ+AStS5HwqQ==;EndpointSuffix=core.windows.net

const express = require("express");
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");
const multer = require("multer");

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const credentials = new StorageSharedKeyCredential(
  'stgehspocdev001',
  'iQNOMLkgOGfkn8tLNjWarxkhcrvdCKaoKZOmRQI34Sx/ZuQv3j8/C6TkZPqVKlTyxi3WbBrUu4bQ+AStS5HwqQ=='
);

const blobService = new BlobServiceClient(
  `https://stgehspocdev001.blob.core.windows.net`,
  credentials
);

const containerName = 'files-demo' || "images";

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const buffer = Buffer.from(req.file.buffer);
    const blobName = req.file.originalname;
    const containerClient = blobService.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.upload(buffer, buffer.length);
    res.status(200).send({ message: "Image uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "An error occurred while uploading the image" });
  }
});


app.get("/images/:imageName", async (req, res) => {
  try {
    const containerClient = blobService.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(req.params.imageName);
    const stream = await blockBlobClient.download();
    res.set("Content-Type", "image/jpeg");
    stream.readableStreamBody.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "An error occurred while retrieving the image" });
  }
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

