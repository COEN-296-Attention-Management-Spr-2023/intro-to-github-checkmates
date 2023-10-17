const express = require('express');
const ocr = require('node-tesseract-ocr');
const cors = require('cors');
const AWS = require('aws-sdk');

const app = express();
const port = 3000;

const config = {
  lang: 'eng',
  oem: 1,
  psm: 3,
}

app.use(express.json());
app.use(cors());

AWS.config.update({
    region: 'us-west-1',
    accessKeyId: 'AKIAXSWCURFK5CEJZTSC',
    secretAccessKey: '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'
  });

const s3 = new AWS.S3();

app.get('/generate-presigned-url', (req, res) => {
    const fileName = req.query.filename; // You can pass the desired filename from the client
    const fileType = req.query.filetype; // And its type, e.g., 'image/jpeg'

    const s3Params = {
        Bucket: 'checkmate-fairfare',
        Key: fileName,
        Expires: 60, // The URL will be valid for 60 seconds
        ContentType: fileType,
        ACL: 'public-read'
    };

    s3.getSignedUrl('putObject', s3Params, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to generate a pre-signed URL' });
        }
        res.json({
            presignedUrl: data,
            imageUrl: `https://${s3Params.Bucket}.s3.amazonaws.com/${fileName}`
        });
    });
});


app.post('/parse', async (req, res) => {
  try {
    const text = await ocr.recognize(req.body.image, config);
    // Extract item and price from the text (this may need refinement)
    const matches = text.match(/(.*\S)\s+(\$\d+\.\d{2})/);
    if (matches && matches.length === 3) {
      res.json({ item: matches[1], price: matches[2] });
    } else {
      res.json({ error: 'Failed to extract item and price.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'OCR processing failed.' });
  }
});

app.get('/test', (req, res) => {
    res.send('test!');
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
