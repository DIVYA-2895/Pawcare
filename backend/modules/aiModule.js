// modules/aiModule.js
// AI Module: Rule-based animal recommendations + vaccination reminders
// This uses simple logic rules — easy to understand and extend later with ML

/**
 * ANIMAL RECOMMENDATION ENGINE
 * 
 * Recommends animals based on user preferences using rule-based scoring.
 * Each animal gets a "match score" — higher score = better match.
 * 
 * @param {Array} animals - List of available animals from database
 * @param {Object} preferences - User preferences object
 * @returns {Array} - Sorted list of animals with match scores
 */
const recommendAnimals = (animals, preferences) => {
  const { species, ageRange, size, experience } = preferences;

  // Only recommend available animals
  const available = animals.filter((a) => a.adoptionStatus === 'available');

  const scored = available.map((animal) => {
    let score = 0;
    const reasons = []; // Explain why this animal matches

    // Rule 1: Species preference match (+40 points)
    if (species && animal.species === species.toLowerCase()) {
      score += 40;
      reasons.push(`Matches your preferred species (${species})`);
    }

    // Rule 2: Age range preference
    // Convert animal age to a category
    const ageInMonths =
      animal.age.unit === 'years'
        ? animal.age.value * 12
        : animal.age.value;

    const ageCategory =
      ageInMonths <= 6 ? 'baby' :
      ageInMonths <= 24 ? 'young' :
      ageInMonths <= 84 ? 'adult' : 'senior';

    if (ageRange && ageCategory === ageRange.toLowerCase()) {
      score += 30;
      reasons.push(`Age matches your preference (${ageRange})`);
    }

    // Rule 3: Health status (+10 for healthy, less for others)
    if (animal.healthStatus === 'healthy') {
      score += 10;
      reasons.push('Animal is in good health');
    } else if (animal.healthStatus === 'recovering') {
      score += 5;
    }

    // Rule 4: Good for first-time owners (prefer adult cats/dogs if first-time)
    if (experience === 'first-time' && ageCategory === 'adult') {
      score += 15;
      reasons.push('Adult animals are great for first-time owners');
    }

    // Rule 5: Has vaccinations (+5 per vaccination)
    const vaccinationBonus = Math.min(animal.vaccinations.length * 5, 20);
    score += vaccinationBonus;
    if (vaccinationBonus > 0) {
      reasons.push(`Has ${animal.vaccinations.length} vaccination record(s)`);
    }

    return {
      animal,
      score,
      matchPercentage: Math.min(Math.round((score / 115) * 100), 100), // Max possible is ~115
      reasons,
    };
  });

  // Sort by score descending and return top results
  return scored.sort((a, b) => b.score - a.score);
};

/**
 * VACCINATION REMINDER ENGINE
 * 
 * Finds all animals with vaccinations due within the next N days.
 * 
 * @param {Array} animals - All animals from database
 * @param {number} daysAhead - Look ahead window (default 30 days)
 * @returns {Array} - List of reminders with animal info and due date
 */
const getVaccinationReminders = (animals, daysAhead = 30) => {
  const reminders = [];
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysAhead);

  animals.forEach((animal) => {
    animal.vaccinations.forEach((vaccination) => {
      if (!vaccination.nextDue) return;

      const dueDate = new Date(vaccination.nextDue);
      const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

      // Include overdue (negative days) and upcoming within window
      if (dueDate <= futureDate) {
        reminders.push({
          animalId: animal._id,
          animalName: animal.name,
          species: animal.species,
          vaccinationName: vaccination.name,
          dueDate: vaccination.nextDue,
          daysUntilDue,
          isOverdue: daysUntilDue < 0,
          urgency:
            daysUntilDue < 0 ? 'overdue' :
            daysUntilDue <= 7 ? 'urgent' :
            daysUntilDue <= 14 ? 'soon' : 'upcoming',
        });
      }
    });
  });

  // Sort by due date (most urgent first)
  return reminders.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
};

module.exports = { recommendAnimals, getVaccinationReminders };
