const express = require('express');
const ejs = require('ejs');
const fs = require('fs');
const app = express();

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

async function query(data) {
  const fetch = (await import('node-fetch')).default;
  const promptWithRandomNumber = data.inputs + " " + Math.floor(Math.random() * 10000);

  const response = await fetch(
    "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
    {
      headers: { Authorization: "Bearer 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" },
      method: "POST",
      body: JSON.stringify({ "inputs": promptWithRandomNumber }),
    }
  );

  const result = await response.arrayBuffer();
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

  await fs.promises.writeFile(imagePath, Buffer.from(imageBuffer));

  res.render('generated', { imageFilename, category });
});

app.post('/compare', async (req, res) => {
  const userPrompt = req.body.userPrompt;
  const category = req.body.category;

  const newImageBuffer = await query({ "inputs": userPrompt });
  const newImageFilename = `new-generated-${category}.png`;
  const newImagePath = `./public/images/${newImageFilename}`;

  await fs.promises.writeFile(newImagePath, Buffer.from(newImageBuffer));

  // TODO: Compare the generated images using an image comparison library or API
  // For now, let's just say the images are "too close"
  const result = 'too close';

  res.render('comparison', { result, imageFilename: `generated-${category}.png`, newImageFilename });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});