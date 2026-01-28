const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const db = require('./database');

const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log(`Created directory: ${UPLOADS_DIR}`);
}

async function processImages() {
    console.log('Starting image processing...');

    // Get all files in uploads directory
    const files = fs.readdirSync(UPLOADS_DIR);
    let processedCount = 0;
    let errors = 0;

    for (const file of files) {
        // Skip already processed webp files
        if (file.endsWith('.webp')) continue;

        const filePath = path.join(UPLOADS_DIR, file);
        const fileExt = path.extname(file).toLowerCase();

        // Check if it's an image
        if (!['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'].includes(fileExt)) {
            continue;
        }

        const fileNameWithoutExt = path.parse(file).name;
        const newFileName = `${fileNameWithoutExt}.webp`;
        const newFilePath = path.join(UPLOADS_DIR, newFileName);

        console.log(`Processing: ${file} -> ${newFileName}`);

        try {
            // Convert to WebP
            await sharp(filePath)
                .webp({ quality: 80 })
                .toFile(newFilePath);

            // Update Database references
            const oldWebPath = `/uploads/${file}`;
            const newWebPath = `/uploads/${newFileName}`;

            await updateDatabaseReferences(oldWebPath, newWebPath);

            // Delete original file
            fs.unlinkSync(filePath);
            console.log(`✅ Converted and cleanup: ${file}`);
            processedCount++;
        } catch (error) {
            console.error(`❌ Error processing ${file}:`, error);
            errors++;
        }
    }

    console.log('-----------------------------------');
    console.log(`Summary:`);
    console.log(`Processed: ${processedCount}`);
    console.log(`Errors: ${errors}`);
    console.log('-----------------------------------');

    // Allow time for DB operations to complete
    setTimeout(() => {
        console.log('Done.');
        process.exit(0);
    }, 2000);
}

function updateDatabaseReferences(oldPath, newPath) {
    return new Promise((resolve, reject) => {
        let pending = 2; // News and Activities

        // Update News
        db.run(
            'UPDATE news SET image = ? WHERE image = ?',
            [newPath, oldPath],
            function (err) {
                if (err) console.error('Error updating news:', err);
                else if (this.changes > 0) console.log(`   Updated ${this.changes} news records.`);

                pending--;
                if (pending === 0) resolve();
            }
        );

        // Update Activities
        db.run(
            'UPDATE activities SET image = ? WHERE image = ?',
            [newPath, oldPath],
            function (err) {
                if (err) console.error('Error updating activities:', err);
                else if (this.changes > 0) console.log(`   Updated ${this.changes} activities records.`);

                pending--;
                if (pending === 0) resolve();
            }
        );
    });
}

processImages();
