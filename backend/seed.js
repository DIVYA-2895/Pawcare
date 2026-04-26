// backend/seed.js
// Database seeder — populates sample data for testing and demo
// Run with: node seed.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Animal = require('./models/Animal');
const Adoption = require('./models/Adoption');

const MONGO_URI = process.env.MONGO_URI;

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Animal.deleteMany({});
    await Adoption.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // =====================
    // SEED USERS
    // =====================
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@pawcare.com',
        password: 'admin123',
        role: 'admin',
      },
      {
        name: 'Shelter Staff',
        email: 'staff@pawcare.com',
        password: 'staff123',
        role: 'staff',
      },
      {
        name: 'Jane Adopter',
        email: 'adopter@pawcare.com',
        password: 'adopter123',
        role: 'adopter',
        preferences: { species: 'dog', ageRange: 'adult', experience: 'some-experience' },
      },
    ]);
    console.log(`👥 Created ${users.length} users`);

    const [admin, staff, adopter] = users;

    // =====================
    // SEED ANIMALS
    // =====================
    const strayDogBreeds = ['Indian Pariah Dog', 'Street Dog', 'Mixed Breed Dog'];
    const strayCatBreeds = ['Indian Street Cat', 'Persian Cat', 'Siamese Cat', 'Mixed Breed Cat'];
    const locations = ['Chennai Street', 'Hyderabad Market', 'Highway Rescue', 'Near Bus Stand', 'Abandoned Building', 'Village Road', 'Mumbai Beach', 'Delhi Park', 'Bangalore Lane', 'Kolkata Alley'];
    
    const dogNames = ['Bruno', 'Milo', 'Kalu', 'Sheru', 'Rocky', 'Tiger', 'Leo', 'Tommy', 'Max', 'Buddy', 'Charlie', 'Jack', 'Cooper', 'Duke', 'Bear', 'Zeus', 'Buster', 'Apollo', 'Dexter', 'Oscar', 'Rusty', 'Shadow', 'Sam', 'Lucky', 'Toby', 'Henry', 'Rex', 'Simba', 'Oliver', 'Harley', 'Loki', 'Koda', 'Zeke', 'Gus', 'Jax', 'Moose', 'Tank', 'Ranger', 'Remi', 'Ace'];
    const catNames = ['Luna', 'Bella', 'Lucy', 'Chloe', 'Mia', 'Coco', 'Nala', 'Lily', 'Stella', 'Molly', 'Ruby', 'Rosie'];
    const otherNames = ['Bunny', 'Flopsy', 'Rio'];
    
    const animalDocs = [];
    
    // Total 56 animals: 41 dogs, 12 cats, 3 others
    for (let i = 0; i < 56; i++) {
      let species, name, breed, image, description;
      
      if (i < 41) {
        species = 'dog';
        name = dogNames[i % dogNames.length];
        const dogBreeds = ['Indian Pariah Dog', 'Street Dog', 'Mixed Breed', 'Labrador Retriever', 'German Shepherd'];
        breed = dogBreeds[i % dogBreeds.length];
        // Ensure specific mapping: Street dog should not show lab image
        // Using IDs that are likely to be appropriate
        const dogImageId = breed.includes('Labrador') ? 10 : (breed.includes('German') ? 12 : (i % 50 + 1));
        image = `https://placedog.net/400/300?id=${dogImageId}`;
        description = `A loyal ${breed} rescued from the streets. Very friendly and healthy.`;
      } else if (i < 53) {
        species = 'cat';
        name = catNames[(i - 41) % catNames.length];
        const catBreeds = ['Indian Street Cat', 'Persian Cat', 'Siamese Cat', 'Mixed Breed Cat'];
        breed = catBreeds[(i - 41) % catBreeds.length];
        image = `https://placehold.co/400x300?text=Cat+${(i - 41) + 1}`; // Placekitten is often down, using placehold.co
        description = `A gentle ${breed} looking for a warm home.`;
      } else {
        species = i === 53 ? 'rabbit' : (i === 54 ? 'bird' : 'other');
        name = otherNames[i - 53];
        breed = species === 'rabbit' ? 'Angora' : (species === 'bird' ? 'Parrot' : 'Unknown');
        image = `https://placehold.co/400x300?text=${species}`;
        description = `A beautiful ${species} rescued and ready for adoption.`;
      }

      const animalData = {
        name,
        species,
        breed,
        age: { value: Math.floor(Math.random() * 5) + 1, unit: 'years' },
        gender: i % 2 === 0 ? 'male' : 'female',
        color: ['Brown', 'Black', 'White', 'Spotted'][i % 4],
        weight: species === 'dog' ? 15 : (species === 'cat' ? 4 : 1),
        description,
        rescueDate: new Date(Date.now() - (Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000)),
        rescueLocation: locations[i % locations.length],
        rescuedBy: 'Animal Rescue Team',
        healthStatus: 'healthy',
        adoptionStatus: i < 15 ? 'adopted' : (i < 20 ? 'pending' : 'available'),
        image,
        addedBy: staff._id,
        vaccinations: []
      };

      // Add 10 vaccination alerts (overdue or urgent)
      if (i < 10) {
        const isOverdue = i < 5;
        const daysOffset = isOverdue ? -5 : 5;
        animalData.vaccinations = [
          {
            name: 'Rabies',
            date: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000),
            nextDue: new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000),
            notes: isOverdue ? 'CRITICAL: Overdue' : 'Upcoming soon'
          }
        ];
      }

      animalDocs.push(animalData);
    }

    const animals = await Animal.create(animalDocs);
    console.log(`🐾 Created ${animals.length} animals (Dogs: 41, Cats: 12, Others: 3)`);

    // =====================
    // SEED ADOPTIONS
    // =====================
    const adoptions = await Adoption.create([
      {
        animal: animals[15]._id, // First pending dog
        applicant: adopter._id,
        status: 'pending',
        message: 'I have a large house and I love dogs! I can provide a great home for this rescue.',
        homeType: 'house-large-yard',
        hasOtherPets: false,
        hasChildren: false,
        experience: 'some-experience',
      }
    ]);
    console.log(`📋 Created ${adoptions.length} adoption requests`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📧 Test Accounts:');
    console.log('   Admin:   admin@pawcare.com / admin123');
    console.log('   Staff:   staff@pawcare.com / staff123');
    console.log('   Adopter: adopter@pawcare.com / adopter123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedData();
