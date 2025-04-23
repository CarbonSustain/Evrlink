import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const images = {
  'birthday.jpg': 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d',
  'wedding.jpg': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed',
  'holiday.jpg': 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be',
  'love.jpg': 'https://images.unsplash.com/photo-1518199266791-5375a83190b7',
  'thankyou.jpg': 'https://images.unsplash.com/photo-1606103920295-9a091573f160',
  'anniversary.jpg': 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486',
  'default.jpg': 'https://images.unsplash.com/photo-1512909006721-3d6018887383'
};

const downloadImage = (url, filename) => {
  const targetPath = path.join(__dirname, 'public', 'categories', filename);
  
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(targetPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded ${filename}`);
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(targetPath, () => reject(err));
      });
    }).on('error', reject);
  });
};

// Create categories directory if it doesn't exist
const categoriesDir = path.join(__dirname, 'public', 'categories');
if (!fs.existsSync(categoriesDir)) {
  fs.mkdirSync(categoriesDir, { recursive: true });
}

// Download all images
Promise.all(
  Object.entries(images).map(([filename, url]) => 
    downloadImage(url, filename)
  )
).then(() => {
  console.log('All images downloaded successfully!');
}).catch((error) => {
  console.error('Error downloading images:', error);
}); 