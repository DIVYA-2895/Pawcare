require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const Animal = require('../models/Animal');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const migrateImages = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // Find all animals that have an image starting with /uploads/
    const animals = await Animal.find({ image: { $regex: '^/uploads/' } });
    console.log(`Found ${animals.length} animals with local image paths.`);

    let successCount = 0;
    let failCount = 0;

    for (const animal of animals) {
      // Extract filename from /uploads/filename.jpg
      const filename = animal.image.split('/').pop();
      const localFilePath = path.join(__dirname, '../uploads', filename);

      if (fs.existsSync(localFilePath)) {
        console.log(`Uploading ${filename}...`);
        try {
          const result = await cloudinary.uploader.upload(localFilePath, {
            folder: 'pawcare_animals',
          });

          // Update DB record
          animal.image = result.secure_url;
          await animal.save();
          
          console.log(`✅ Successfully migrated ${animal.name}'s image to Cloudinary.`);
          successCount++;
        } catch (uploadError) {
          console.error(`❌ Failed to upload ${filename} to Cloudinary:`, uploadError.message);
          failCount++;
        }
      } else {
        console.log(`⚠️ Local file not found for ${animal.name}: ${localFilePath}`);
        failCount++;
      }
    }

    console.log('--- Migration Summary ---');
    console.log(`Successfully migrated: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration script error:', error);
    process.exit(1);
  }
};

migrateImages();
