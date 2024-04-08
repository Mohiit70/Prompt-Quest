const express = require('express');
const ejs = require('ejs');
const fs = require('fs');
const mindsdb = require('mindsdb-sdk');
const app = express();

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize MindsDB
const mindsdbClient = new mindsdb.SqlClient('http://localhost:47334');

// Set the feature flag for image comparison
const isComparisonEnabled = true; // Set to true or false based on your requirement

app.get('/', (req, res) => {
  res.render('index');
});

async function query(data) {
  const fetch = await import('node-fetch');
  const promptWithRandomNumber = data.inputs + " " + Math.floor(Math.random() * 10000);

  const response = await fetch.default(
    "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
    {
      headers: { Authorization: "Bearer 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" },
      method: "POST",
      body: JSON.stringify({ "inputs": promptWithRandomNumber }),
    }
  );
  const result = await response.buffer();
  return result;
}

app.post('/generate', async (req, res) => {
  const category = req.body.category;
  const promptMap = {
    car: "Generate a unique car design",
    place: "Generate a unique place",
    food: "Generate a unique food",
    animal: "Generate a unique animal",
  };

  const prompt = promptMap[category];

  const imageBuffer = await query({ "inputs": prompt });
  const imageFilename = `generated-${category}.png`;
  const imagePath = `./public/images/${imageFilename}`;

  await fs.promises.writeFile(imagePath, imageBuffer);

  res.render('generated', { imageFilename, category });
});

app.post('/compare', async (req, res) => {
  const userPrompt = req.body.userPrompt;
  const category = req.body.category;

  // Generate a new image using the user's prompt
  const newImageBuffer = await query({ "inputs": userPrompt });
  const newImageFilename = `new-generated-${category}.png`;
  const newImagePath = `./public/images/${newImageFilename}`;

  await fs.promises.writeFile(newImagePath, newImageBuffer);

  if (isComparisonEnabled) {
    // Compare the generated images using MindsDB
    const comparisonResult = await mindsdbClient.query(`
      SELECT similarity(${imagePath}, ${newImagePath}) AS similarity
    `);

    const similarity = comparisonResult[0].similarity;

    let result;
    if (similarity >= 0.8) {
      result = 'win';
    } else if (similarity >= 0.6) {
      result = 'too close';
    } else {
      result = 'lose';
    }

    res.render('comparison', { result, imageFilename, newImageFilename });
  } else {
    res.send('Image comparison feature is currently disabled');
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});