const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const Tag = require('../models/Tag');
const User = require('../models/User');

const standardTags = [
  { name: 'C Programming', category: 'Programming' },
  { name: 'C++', category: 'Programming' },
  { name: 'C++ Graph Algorithms', category: 'Data Structures & Algorithms' },
  { name: 'Data Structures', category: 'Data Structures & Algorithms' },
  { name: 'Algorithms', category: 'Data Structures & Algorithms' },
  { name: 'Java', category: 'Programming' },
  { name: 'Python', category: 'Programming' },
  { name: 'Python for Machine Learning', category: 'Machine Learning' },
  { name: 'React', category: 'Web Development' },
  { name: 'React UI', category: 'Web Development' },
  { name: 'React Hooks', category: 'Web Development' },
  { name: 'JavaScript', category: 'Web Development' },
  { name: 'HTML', category: 'Web Development' },
  { name: 'CSS', category: 'Web Development' },
  { name: 'Database Design', category: 'Databases' },
  { name: 'SQL', category: 'Databases' },
  { name: 'MongoDB', category: 'Databases' },
  { name: 'Node.js', category: 'Backend Development' },
  { name: 'Express.js', category: 'Backend Development' },
  { name: 'Machine Learning', category: 'Machine Learning' },
  { name: 'Artificial Intelligence', category: 'Machine Learning' },
  { name: 'Computer Architecture', category: 'Systems' },
  { name: 'Operating Systems', category: 'Systems' },
  { name: 'Computer Networks', category: 'Systems' },
  { name: 'CAE', category: 'Engineering' },
  { name: 'Flutter', category: 'Mobile Development' },
  { name: 'System Architecture', category: 'Software Engineering' },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to database.');

    console.log('[Seed] Seeding academic topic taxonomy...');
    const tagMap = new Map();

    for (const item of standardTags) {
      const existing = await Tag.findOne({ name: item.name });
      if (!existing) {
        const created = await Tag.create(item);
        tagMap.set(item.name, created._id);
        console.log(`  + Created tag: ${item.name}`);
      } else {
        tagMap.set(item.name, existing._id);
      }
    }

    console.log(`[Seed] Tag taxonomy ready (${tagMap.size} topics).`);

    // Check if sample peers exist
    const defaultPassword = await bcrypt.hash('SkillBridge2026!', 10);

    const samplePeers = [
      {
        fullName: 'Rafi Ahmed',
        email: 'rafi.cse@aust.edu',
        studentId: '22.01.04.001',
        department: 'Department of Computer Science & Engineering (CSE)',
        semester: '3.1',
        passwordHash: defaultPassword,
        contextBio: 'Can help with C++ graph algorithms and memory management. Looking for someone to guide me on React UI layouts.',
        strongTags: [tagMap.get('C++ Graph Algorithms'), tagMap.get('Data Structures'), tagMap.get('C++')].filter(Boolean),
        weakTags: [tagMap.get('React UI'), tagMap.get('React Hooks'), tagMap.get('React')].filter(Boolean),
        avatar: 'R',
      },
      {
        fullName: 'Mehjabin Tasnim',
        email: 'mehjabin.cse@aust.edu',
        studentId: '22.01.04.002',
        department: 'Department of Computer Science & Engineering (CSE)',
        semester: '2.2',
        passwordHash: defaultPassword,
        contextBio: 'Experienced with Python and ML models. Looking for practice with Data Structures and Tree algorithms.',
        strongTags: [tagMap.get('Python'), tagMap.get('Machine Learning'), tagMap.get('Python for Machine Learning')].filter(Boolean),
        weakTags: [tagMap.get('Data Structures'), tagMap.get('Algorithms')].filter(Boolean),
        avatar: 'M',
      },
      {
        fullName: 'Siam Uddin',
        email: 'siam.eee@aust.edu',
        studentId: '21.02.05.015',
        department: 'Department of Electrical & Electronic Engineering (EEE)',
        semester: '3.2',
        passwordHash: defaultPassword,
        contextBio: 'Can exchange engineering CAE simulation knowledge for practical Python/ML skills.',
        strongTags: [tagMap.get('CAE'), tagMap.get('Computer Architecture')].filter(Boolean),
        weakTags: [tagMap.get('Python for Machine Learning'), tagMap.get('Python')].filter(Boolean),
        avatar: 'S',
      },
      {
        fullName: 'Nafisa Islam',
        email: 'nafisa.cse@aust.edu',
        studentId: '23.01.04.040',
        department: 'Department of Computer Science & Engineering (CSE)',
        semester: '2.1',
        passwordHash: defaultPassword,
        contextBio: 'Strong foundation in Java and OOP concepts. Looking to explore Database Design and MongoDB.',
        strongTags: [tagMap.get('Java'), tagMap.get('Algorithms')].filter(Boolean),
        weakTags: [tagMap.get('Database Design'), tagMap.get('MongoDB')].filter(Boolean),
        avatar: 'N',
      },
    ];

    console.log('[Seed] Seeding sample student peers...');
    for (const peer of samplePeers) {
      const existingUser = await User.findOne({ email: peer.email });
      if (!existingUser) {
        await User.create(peer);
        console.log(`  + Created peer: ${peer.fullName} (${peer.email})`);
      } else {
        await User.findByIdAndUpdate(existingUser._id, {
          strongTags: peer.strongTags,
          weakTags: peer.weakTags,
          contextBio: peer.contextBio,
          department: peer.department,
          semester: peer.semester,
        });
        console.log(`  * Updated peer: ${peer.fullName}`);
      }
    }

    console.log('\n✔ SkillBridge database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
