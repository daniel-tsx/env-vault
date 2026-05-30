import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function convertSvgToIco() {
  const svgPath = path.join(process.cwd(), 'logo.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf-8');

  // Define sizes for ICO file
  const sizes = [16, 32, 48, 64, 128, 256];
  const pngBuffers = [];

  console.log('Converting SVG to PNG at multiple sizes...');
  
  for (const size of sizes) {
    const resvg = new Resvg(svgContent, {
      fitTo: {
        mode: 'width',
        value: size,
      },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    
    // Resize to exact size using sharp
    const resizedBuffer = await sharp(pngBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    
    pngBuffers.push({ size, buffer: resizedBuffer });
    console.log(`✓ Generated ${size}x${size} PNG`);
  }

  // Create ICO file
  console.log('\nCreating ICO file...');
  const icoBuffer = await createIco(pngBuffers);
  
  const icoPath = path.join(process.cwd(), 'public', 'favicon.ico');
  fs.writeFileSync(icoPath, icoBuffer);
  console.log(`✓ Created ${icoPath}`);

  // Also create a PNG version for other uses
  const pngPath = path.join(process.cwd(), 'public', 'logo.png');
  const largePng = await sharp(pngBuffers[pngBuffers.length - 1].buffer)
    .png()
    .toBuffer();
  fs.writeFileSync(pngPath, largePng);
  console.log(`✓ Created ${pngPath}`);
}

async function createIco(pngBuffers) {
  // ICO file format header
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type (1 = ICO)
  header.writeUInt16LE(pngBuffers.length, 4); // Number of images

  // Calculate directory entries
  const directoryEntries = [];
  let offset = 6 + (pngBuffers.length * 16); // Header + directory entries

  for (const { size, buffer } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size === 256 ? 0 : size, 0); // Width (0 = 256)
    entry.writeUInt8(size === 256 ? 0 : size, 1); // Height (0 = 256)
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(buffer.length, 8); // Image data size
    entry.writeUInt32LE(offset, 12); // Image data offset
    
    directoryEntries.push(entry);
    offset += buffer.length;
  }

  // Combine all parts
  const icoBuffer = Buffer.concat([
    header,
    ...directoryEntries,
    ...pngBuffers.map(p => p.buffer)
  ]);

  return icoBuffer;
}

convertSvgToIco().catch(console.error);
