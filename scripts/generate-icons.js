const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceIcon = path.join(__dirname, '../public/treeshop-logo.png');
const outputDir = path.join(__dirname, '../public/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log('Generating PWA icons from treeshop-logo.png...');

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

    await sharp(sourceIcon)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated ${size}x${size} icon`);
  }

  // Generate apple-touch-icon (180x180)
  await sharp(sourceIcon)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 0, g: 122, b: 255, alpha: 1 } // Apple blue background
    })
    .png()
    .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));
  console.log('✓ Generated apple-touch-icon.png');

  // Generate favicon (32x32)
  await sharp(sourceIcon)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(path.join(__dirname, '../public/favicon-32x32.png'));
  console.log('✓ Generated favicon-32x32.png');

  console.log('✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
