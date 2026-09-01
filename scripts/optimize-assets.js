#!/usr/bin/env node

/**
 * Asset Optimization Script
 * 
 * Converts PNG/JPG images to WebP format for better performance
 * Generates multiple sizes for responsive images
 * Creates favicon variants for different platforms
 * 
 * Usage:
 *   node scripts/optimize-assets.js
 * 
 * Requirements:
 *   npm install sharp --save-dev
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUBLIC_DIR = path.join(__dirname, '../frontend/public');
const LOGOS_DIR = path.join(PUBLIC_DIR, 'logos');

// Ensure logos directory exists
if (!fs.existsSync(LOGOS_DIR)) {
  fs.mkdirSync(LOGOS_DIR, { recursive: true });
}

const SIZES = {
  favicon: [16, 32, 48],
  apple: [180],
  logo: [64, 128, 256, 512],
};

async function convertToWebP(inputPath, outputPath, size = null) {
  try {
    let pipeline = sharp(inputPath);
    
    if (size) {
      pipeline = pipeline.resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      });
    }
    
    await pipeline
      .webp({ quality: 90, effort: 6 })
      .toFile(outputPath);
    
    console.log(`✅ Created: ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`❌ Error converting ${inputPath}:`, error.message);
  }
}

async function createFaviconVariants(inputPath) {
  console.log('\n📦 Generating favicon variants...');
  
  // Generate PNG favicons (for browsers that don't support SVG favicons)
  for (const size of SIZES.favicon) {
    await sharp(inputPath)
      .resize(size, size)
      .png()
      .toFile(path.join(PUBLIC_DIR, `favicon-${size}x${size}.png`));
    console.log(`✅ Created: favicon-${size}x${size}.png`);
  }
  
  // Generate Apple Touch Icon
  for (const size of SIZES.apple) {
    await sharp(inputPath)
      .resize(size, size)
      .png()
      .toFile(path.join(PUBLIC_DIR, `apple-touch-icon.png`));
    console.log(`✅ Created: apple-touch-icon.png (${size}x${size})`);
  }
}

async function createLogoVariants(inputPath, baseName) {
  console.log(`\n📦 Generating ${baseName} variants...`);
  
  // Generate WebP at multiple sizes
  for (const size of SIZES.logo) {
    await convertToWebP(
      inputPath,
      path.join(LOGOS_DIR, `${baseName}-${size}.webp`),
      size
    );
  }
  
  // Generate PNG fallbacks
  for (const size of SIZES.logo) {
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(LOGOS_DIR, `${baseName}-${size}.png`));
    console.log(`✅ Created: ${baseName}-${size}.png`);
  }
}

async function optimizeExistingPNGs() {
  console.log('\n🔍 Scanning for PNG files to optimize...');
  
  const files = fs.readdirSync(PUBLIC_DIR);
  const pngFiles = files.filter(f => f.endsWith('.png') && !f.includes('deleted'));
  
  for (const file of pngFiles) {
    const inputPath = path.join(PUBLIC_DIR, file);
    const stats = fs.statSync(inputPath);
    
    if (stats.size > 50000) { // Only optimize files > 50KB
      const outputPath = path.join(LOGOS_DIR, file.replace('.png', '.webp'));
      await convertToWebP(inputPath, outputPath);
      
      // Show size comparison
      const webpStats = fs.statSync(outputPath);
      const savings = ((1 - webpStats.size / stats.size) * 100).toFixed(1);
      console.log(`   📊 Size reduction: ${(stats.size / 1024).toFixed(1)}KB → ${(webpStats.size / 1024).toFixed(1)}KB (${savings}% smaller)`);
    }
  }
}

async function generateSiteManifest() {
  console.log('\n📝 Generating site.webmanifest...');
  
  const manifest = {
    name: 'Essor',
    short_name: 'Essor',
    description: 'La solution tout-en-un pour votre école',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B1220',
    theme_color: '#2563EB',
    icons: [
      {
        src: '/logos/essor-logo-mark-64.png',
        sizes: '64x64',
        type: 'image/png'
      },
      {
        src: '/logos/essor-logo-mark-128.png',
        sizes: '128x128',
        type: 'image/png'
      },
      {
        src: '/logos/essor-logo-mark-256.png',
        sizes: '256x256',
        type: 'image/png'
      },
      {
        src: '/logos/essor-logo-mark-512.png',
        sizes: '512x512',
        type: 'image/png'
      },
      {
        src: '/logos/essor-logo-mark-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  };
  
  fs.writeFileSync(
    path.join(PUBLIC_DIR, 'site.webmanifest'),
    JSON.stringify(manifest, null, 2)
  );
  
  console.log('✅ Created: site.webmanifest');
}

async function generateHTMLSnippet() {
  console.log('\n📋 Generating HTML meta tags snippet...');
  
  const html = `
<!-- Favicon & Icons - Add to <head> -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://essor.eiden-group.com" />
<meta property="og:title" content="Essor — Plateforme tout-en-un pour écoles" />
<meta property="og:description" content="Tout avance, simplement. Gérez votre école, votre équipe et vos étudiants en ligne." />
<meta property="og:image" content="https://essor.eiden-group.com/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content="https://essor.eiden-group.com" />
<meta name="twitter:title" content="Essor — Plateforme tout-en-un pour écoles" />
<meta name="twitter:description" content="Tout avance, simplement." />
<meta name="twitter:image" content="https://essor.eiden-group.com/og-image.png" />

<!-- Theme -->
<meta name="theme-color" content="#2563EB" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
`;
  
  fs.writeFileSync(
    path.join(__dirname, '../frontend/meta-tags.html'),
    html.trim()
  );
  
  console.log('✅ Created: frontend/meta-tags.html');
}

// Main execution
async function main() {
  console.log('🚀 Essor Asset Optimization');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    // Check if icon.png exists for processing
    const iconPath = path.join(PUBLIC_DIR, 'icon.png');
    if (fs.existsSync(iconPath)) {
      await createFaviconVariants(iconPath);
      await createLogoVariants(iconPath, 'essor-logo-mark');
    } else {
      console.log('⚠️  icon.png not found, skipping icon generation');
    }
    
    // Optimize existing large PNGs
    await optimizeExistingPNGs();
    
    // Generate manifest and meta tags
    await generateSiteManifest();
    await generateHTMLSnippet();
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Asset optimization complete!');
    console.log('\n📦 Generated files:');
    console.log('   • /public/logos/ - WebP & PNG variants');
    console.log('   • /public/favicon-*.png - Multiple sizes');
    console.log('   • /public/apple-touch-icon.png - iOS icon');
    console.log('   • /public/site.webmanifest - PWA manifest');
    console.log('   • /frontend/meta-tags.html - HTML snippet');
    console.log('\n💡 Next steps:');
    console.log('   1. Copy meta tags from meta-tags.html to index.html');
    console.log('   2. Update image references to use WebP with PNG fallback');
    console.log('   3. Test icons on different devices/browsers');
    console.log('   4. Deploy and verify OG image displays correctly');
    
  } catch (error) {
    console.error('\n❌ Error during optimization:', error);
    process.exit(1);
  }
}

// Check if sharp is installed
try {
  require.resolve('sharp');
  main();
} catch (e) {
  console.error('❌ Error: sharp is not installed');
  console.log('\n📦 Install sharp to run this script:');
  console.log('   npm install --save-dev sharp');
  console.log('\nThen run again:');
  console.log('   node scripts/optimize-assets.js');
  process.exit(1);
}
