import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Resource from '../models/Resource.js';
import Favourite from '../models/Favourite.js';
import Review from '../models/Review.js';
import Report from '../models/Report.js';
import { seedUsers, seedResources } from './seedData.js';

dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillnest';

const importData = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('[Seeder] Connected to MongoDB...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany(),
      Resource.deleteMany(),
      Favourite.deleteMany(),
      Review.deleteMany(),
      Report.deleteMany(),
    ]);
    console.log('[Seeder] Cleared previous records.');

    // Insert Users (using User.create so pre-save password hashing is executed)
    const createdUsers = [];
    for (const u of seedUsers) {
      const user = await User.create(u);
      createdUsers.push(user);
    }
    console.log(`[Seeder] Created ${createdUsers.length} users.`);

    const adminUser = createdUsers[0];
    const learnerUser = createdUsers[1];
    const studentUser = createdUsers[2];

    // Assign author to resources
    const resourcesToInsert = seedResources.map((res, index) => {
      // Rotate author among seeded users
      const author = index % 3 === 0 ? adminUser._id : index % 3 === 1 ? learnerUser._id : studentUser._id;
      return {
        ...res,
        author,
        status: 'approved',
        views: Math.floor(Math.random() * 240) + 15,
      };
    });

    const createdResources = await Resource.insertMany(resourcesToInsert);
    console.log(`[Seeder] Inserted ${createdResources.length} educational resources.`);

    // Add some reviews
    const reviewsData = [
      {
        resource: createdResources[0]._id, // CS50x
        user: learnerUser._id,
        rating: 5,
        reviewText: 'David Malan is an incredible instructor. This course completely changed my perception of computer science and problem solving!',
      },
      {
        resource: createdResources[0]._id,
        user: studentUser._id,
        rating: 5,
        reviewText: 'Challenging problem sets, but the satisfaction after passing the test cases in C and Python is unmatched.',
      },
      {
        resource: createdResources[1]._id, // The Odin Project
        user: studentUser._id,
        rating: 5,
        reviewText: 'The project-based curriculum forces you to read documentation and troubleshoot errors on your own. Best free roadmap ever.',
      },
      {
        resource: createdResources[2]._id, // Full Stack Open
        user: learnerUser._id,
        rating: 5,
        reviewText: 'Extremely high quality exercises for modern React, Redux Toolkit, and Node backend architectures.',
      },
      {
        resource: createdResources[3]._id, // MDN
        user: learnerUser._id,
        rating: 5,
        reviewText: 'MDN is the single most accurate reference for JavaScript and CSS syntax.',
      },
      {
        resource: createdResources[5]._id, // React Dev
        user: studentUser._id,
        rating: 5,
        reviewText: 'The new interactive sandboxes make learning hooks like useEffect and useMemo so intuitive.',
      },
      {
        resource: createdResources[8]._id, // NeetCode
        user: learnerUser._id,
        rating: 5,
        reviewText: 'NeetCode 150 saved my coding interviews! Clean Python code explanations.',
      },
    ];

    for (const rev of reviewsData) {
      await Review.create(rev);
    }
    console.log(`[Seeder] Created ${reviewsData.length} reviews and calculated ratings.`);

    // Add some favourites for the demo learner
    const favouritesData = [
      { user: learnerUser._id, resource: createdResources[0]._id },
      { user: learnerUser._id, resource: createdResources[1]._id },
      { user: learnerUser._id, resource: createdResources[5]._id },
      { user: learnerUser._id, resource: createdResources[8]._id },
      { user: studentUser._id, resource: createdResources[0]._id },
      { user: studentUser._id, resource: createdResources[2]._id },
    ];

    for (const fav of favouritesData) {
      await Favourite.create(fav);
      await Resource.findByIdAndUpdate(fav.resource, {
        $inc: { favouritesCount: 1 },
      });
    }
    console.log(`[Seeder] Seeded favourites successfully.`);

    console.log('----------------------------------------------------');
    console.log(' [SkillNest Seeding Complete!]');
    console.log(' Admin credentials:   admin@skillnest.org / Admin@123456');
    console.log(' Learner credentials: learner@skillnest.org / Learner@123456');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await mongoose.connect(mongoURI);
    await Promise.all([
      User.deleteMany(),
      Resource.deleteMany(),
      Favourite.deleteMany(),
      Review.deleteMany(),
      Report.deleteMany(),
    ]);
    console.log('[Seeder] All database records deleted.');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Destroy Error]: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
