const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
const env = require('../config/env');

const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const Task = require('../models/Task');
const Note = require('../models/Note');
const Event = require('../models/Event');
const Reminder = require('../models/Reminder');
const Notification = require('../models/Notification');
const Document = require('../models/Document');
const DailyActivity = require('../models/DailyActivity');
const FitnessRecord = require('../models/FitnessRecord');
const Goal = require('../models/Goal');
const GoalProgress = require('../models/GoalProgress');

async function seedDataForUser(email = 'om@gmail.com') {
  await mongoose.connect(env.MONGODB_URI);
  console.log(`[Seed] Connected to database: ${env.MONGODB_URI}`);

  let user = await User.findOne({ email });
  if (!user) {
    console.log(`[Seed] User ${email} not found. Creating user...`);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('654321', salt);
    user = await User.create({
      name: 'Om',
      email: email,
      passwordHash,
      bio: 'Software Engineer · Bengaluru'
    });
  }

  const userId = user._id;
  console.log(`[Seed] Populating rich multi-month data for user: ${user.name} (${user.email} - ${userId})`);

  // Clear existing items for clean populate
  await Promise.all([
    Task.deleteMany({ $or: [{ user: userId }, { userId: userId }] }),
    Note.deleteMany({ $or: [{ user: userId }, { userId: userId }] }),
    Event.deleteMany({ $or: [{ user: userId }, { userId: userId }] }),
    Reminder.deleteMany({ $or: [{ user: userId }, { userId: userId }] }),
    Notification.deleteMany({ $or: [{ user: userId }, { userId: userId }] }),
    Document.deleteMany({ $or: [{ user: userId }, { userId: userId }] }),
    DailyActivity.deleteMany({ $or: [{ user: userId }, { userId: userId }] }),
    FitnessRecord.deleteMany({ $or: [{ user: userId }, { userId: userId }] }),
    Goal.deleteMany({ $or: [{ user: userId }, { userId: userId }] }),
    GoalProgress.deleteMany({ $or: [{ user: userId }, { userId: userId }] })
  ]);

  console.log('[Seed] Cleared prior entries for clean generation.');

  // ==========================================
  // 1. GOALS & GOAL PROGRESS
  // ==========================================
  const goalsData = [
    {
      user: userId,
      userId: userId,
      title: 'Run 100 Kilometers in Q3',
      description: 'Cardiovascular endurance goal across July, August, and September.',
      category: 'Health',
      timeframe: 'medium_term',
      targetDate: new Date('2026-09-30'),
      status: 'active',
      metrics: { targetValue: 100, currentValue: 78, unit: 'km' },
      progressPercent: 78
    },
    {
      user: userId,
      userId: userId,
      title: 'Read 12 Technical & Leadership Books',
      description: 'Expand knowledge in system design, distributed systems, and team leadership.',
      category: 'Personal',
      timeframe: 'long_term',
      targetDate: new Date('2026-12-31'),
      status: 'active',
      metrics: { targetValue: 12, currentValue: 8, unit: 'books' },
      progressPercent: 67
    },
    {
      user: userId,
      userId: userId,
      title: 'Build ₹1,00,000 Emergency Fund',
      description: 'Automate a practical monthly savings transfer from salary.',
      category: 'Finance',
      timeframe: 'medium_term',
      targetDate: new Date('2026-10-31'),
      status: 'active',
      metrics: { targetValue: 100000, currentValue: 64000, unit: 'INR' },
      progressPercent: 82
    },
    {
      user: userId,
      userId: userId,
      title: 'Deploy Full-Stack Microservices Architecture',
      description: 'End-to-end containerized deployment with CI/CD pipelines.',
      category: 'Career',
      timeframe: 'short_term',
      targetDate: new Date('2026-07-28'),
      status: 'completed',
      metrics: { targetValue: 100, currentValue: 100, unit: '%' },
      progressPercent: 100
    }
  ];

  const createdGoals = await Goal.insertMany(goalsData);
  console.log(`[Seed] Created ${createdGoals.length} Goals.`);

  // Goal Progress Logs
  const progressLogs = [
    { goal: createdGoals[0]._id, user: userId, userId: userId, logDate: new Date('2026-07-10'), valueAdded: 15, notes: '5km runs x 3 in first week of July' },
    { goal: createdGoals[0]._id, user: userId, userId: userId, logDate: new Date('2026-07-24'), valueAdded: 20, notes: 'Long weekend trail run' },
    { goal: createdGoals[0]._id, user: userId, userId: userId, logDate: new Date('2026-08-08'), valueAdded: 25, notes: 'Morning park intervals' },
    { goal: createdGoals[0]._id, user: userId, userId: userId, logDate: new Date('2026-08-22'), valueAdded: 18, notes: 'Tempo pace session' },
    { goal: createdGoals[1]._id, user: userId, userId: userId, logDate: new Date('2026-07-15'), valueAdded: 1, notes: 'Finished Designing Data-Intensive Applications' },
    { goal: createdGoals[1]._id, user: userId, userId: userId, logDate: new Date('2026-08-05'), valueAdded: 1, notes: 'Finished Staff Engineer by Will Larson' },
    { goal: createdGoals[2]._id, user: userId, userId: userId, logDate: new Date('2026-07-31'), valueAdded: 1200, notes: 'July automated savings transfer' },
    { goal: createdGoals[2]._id, user: userId, userId: userId, logDate: new Date('2026-08-25'), valueAdded: 1000, notes: 'August paycheck savings allotment' }
  ];
  await GoalProgress.insertMany(progressLogs);

  // ==========================================
  // 2. TASKS (Previous Month, Current Month, Next Month)
  // ==========================================
  const tasksData = [
    // --- July 2026 (Previous Month - Completed) ---
    {
      user: userId,
      userId: userId,
      title: 'Q2 Performance Review & Milestone Audit',
      description: 'Review OKRs and KPI deliverables for engineering team.',
      status: 'completed',
      priority: 'high',
      dueDate: new Date('2026-07-08'),
      dueTime: '17:00',
      completedAt: new Date('2026-07-08T16:30:00Z'),
      tags: ['work', 'review', 'management'],
      subtasks: [
        { title: 'Aggregate sprint completion metrics', isCompleted: true },
        { title: 'Conduct peer review 1-on-1s', isCompleted: true },
        { title: 'Submit final summary report', isCompleted: true }
      ]
    },
    {
      user: userId,
      userId: userId,
      title: 'Migrate Cloud Database to MongoDB Atlas Cluster',
      description: 'Upgrade cluster topology with automated daily snapshots.',
      status: 'completed',
      priority: 'urgent',
      dueDate: new Date('2026-07-16'),
      dueTime: '14:00',
      completedAt: new Date('2026-07-16T13:45:00Z'),
      tags: ['database', 'devops', 'backend'],
      subtasks: [
        { title: 'Test replica sets in staging', isCompleted: true },
        { title: 'Perform zero-downtime cutover', isCompleted: true },
        { title: 'Verify index consistency', isCompleted: true }
      ]
    },
    {
      user: userId,
      userId: userId,
      title: 'Annual Dental Checkup & Hygiene Session',
      description: 'Routine oral wellness consultation with Dr. Smith.',
      status: 'completed',
      priority: 'medium',
      dueDate: new Date('2026-07-22'),
      dueTime: '10:30',
      completedAt: new Date('2026-07-22T11:15:00Z'),
      tags: ['health', 'personal']
    },
    {
      user: userId,
      userId: userId,
      title: 'Renew Vehicle Insurance & Emission Certification',
      description: 'Compare policy tiers and secure annual comprehensive coverage.',
      status: 'completed',
      priority: 'high',
      dueDate: new Date('2026-07-29'),
      dueTime: '18:00',
      completedAt: new Date('2026-07-28T14:20:00Z'),
      tags: ['finance', 'personal', 'auto']
    },

    // --- August 2026 (Current Month - Active & In Progress) ---
    {
      user: userId,
      userId: userId,
      title: 'Finalize OneSpace Multi-Tier Architecture & Specs',
      description: 'Ensure Mongoose models, controllers, and React components are aligned.',
      status: 'completed',
      priority: 'urgent',
      dueDate: new Date('2026-08-25'),
      dueTime: '19:00',
      completedAt: new Date('2026-08-25T18:00:00Z'),
      tags: ['onespace', 'architecture', 'coding'],
      subtasks: [
        { title: 'Validate all 12 backend schema models', isCompleted: true },
        { title: 'Verify dark navy UI aesthetic', isCompleted: true },
        { title: 'Execute API test suite with 100% pass', isCompleted: true }
      ]
    },
    {
      user: userId,
      userId: userId,
      title: 'Implement Dark Navy Palette & Splash Screen Animation',
      description: 'Lock in permanent dark navy theme with 3s modern splash intro.',
      status: 'completed',
      priority: 'high',
      dueDate: new Date('2026-08-26'),
      dueTime: '14:00',
      completedAt: new Date('2026-08-26T12:00:00Z'),
      tags: ['frontend', 'ui/ux', 'design']
    },
    {
      user: userId,
      userId: userId,
      title: 'Optimize API Response Caching & Rate Limiting',
      description: 'Configure Redis cache for high-frequency dashboard queries.',
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date('2026-08-28'),
      dueTime: '18:00',
      tags: ['backend', 'performance', 'redis'],
      subtasks: [
        { title: 'Benchmark baseline endpoint latencies', isCompleted: true },
        { title: 'Implement cache invalidation middleware', isCompleted: false },
        { title: 'Stress test under 1000 req/sec', isCompleted: false }
      ]
    },
    {
      user: userId,
      userId: userId,
      title: 'Prepare Monthly Budget & Investment Allocation',
      description: 'Review July/August expenditures and balance index funds.',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date('2026-08-30'),
      dueTime: '20:00',
      tags: ['finance', 'budget']
    },

    // --- September 2026 (Next Month - Scheduled & Planned) ---
    {
      user: userId,
      userId: userId,
      title: 'Q4 Product Roadmap & Feature Prioritization Workshop',
      description: 'Cross-functional session to map out AI integrations and mobile app.',
      status: 'pending',
      priority: 'urgent',
      dueDate: new Date('2026-09-04'),
      dueTime: '11:00',
      tags: ['strategy', 'product', 'work'],
      subtasks: [
        { title: 'Draft capability matrix draft', isCompleted: false },
        { title: 'Align with design and engineering leads', isCompleted: false },
        { title: 'Publish finalized roadmap deck', isCompleted: false }
      ]
    },
    {
      user: userId,
      userId: userId,
      title: 'Renew Cloud Security Certificates & Domain Keys',
      description: 'Automate TLS certificate renewal via Let’s Encrypt Certbot.',
      status: 'pending',
      priority: 'high',
      dueDate: new Date('2026-09-12'),
      dueTime: '16:00',
      tags: ['security', 'devops']
    },
    {
      user: userId,
      userId: userId,
      title: 'Global Tech Summit 2026 — Keynote & Workshops',
      description: 'Attend keynote on Agentic AI and cloud native architectures.',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date('2026-09-18'),
      dueTime: '09:00',
      tags: ['conference', 'networking', 'learning']
    },
    {
      user: userId,
      userId: userId,
      title: 'Comprehensive Bi-Annual Health & Bloodwork Screening',
      description: 'Full metabolic panel, lipid profile, and vitamin D check.',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date('2026-09-24'),
      dueTime: '08:30',
      tags: ['health', 'wellness']
    }
  ];

  await Task.insertMany(tasksData);
  console.log(`[Seed] Created ${tasksData.length} Tasks across 3 months.`);

  // ==========================================
  // 3. NOTES (Rich Markdown Notes)
  // ==========================================
  const notesData = [
    {
      user: userId,
      userId: userId,
      title: 'OneSpace Architecture & Design Principles',
      content: `# OneSpace System Architecture\n\n- **Client:** React SPA with Vite, Tailwind CSS, Lucide Icons\n- **Server:** Express REST API with JWT Auth, Role RBAC\n- **Database:** MongoDB with Mongoose pre-validate normalization\n- **Theme:** Fixed Dark Navy (#0B0F19) with subtle blue-purple glow accents\n\n### Key Modules\n1. Task & Subtask Management\n2. Real-Time Notes & Markdown Export\n3. Interactive Daily/Weekly/Monthly Calendar\n4. Daily Activity & Mood Consistency Tracker\n5. Comprehensive Fitness & Health Telemetry\n6. Milestones & Goal Progress Tracking`,
      category: 'Work',
      tags: ['architecture', 'onespace', 'tech'],
      color: '#3B82F6',
      isPinned: true,
      createdAt: new Date('2026-07-05'),
      updatedAt: new Date('2026-08-20')
    },
    {
      user: userId,
      userId: userId,
      title: 'Q3 & Q4 Financial & Investment Strategy',
      content: `## Target Asset Allocations 2026\n\n- **Total Stock Index (Nifty 50 index fund):** 60%\n- **International Index (balanced index fund):** 20%\n- **Emergency High-Yield Savings:** 15%\n- **Alternative / Tech Opportunities:** 5%\n\n*Rule of thumb:* Automate monthly SIP transfers on the 28th of every month.`,
      category: 'Finance',
      tags: ['investing', 'savings', 'future'],
      color: '#10B981',
      isPinned: true,
      createdAt: new Date('2026-07-12'),
      updatedAt: new Date('2026-08-15')
    },
    {
      user: userId,
      userId: userId,
      title: 'Recommended Book Summaries — Q3 2026',
      content: `### 1. Designing Data-Intensive Applications (Martin Kleppmann)\n- Replication vs Partitioning\n- Consensus algorithms (Raft, Paxos)\n- Stream processing & event sourcing\n\n### 2. Atomic Habits (James Clear)\n- 1% improvement compounded daily\n- Cue -> Craving -> Response -> Reward\n- Environment design over pure willpower`,
      category: 'Learning',
      tags: ['books', 'reading', 'self-improvement'],
      color: '#8B5CF6',
      isPinned: false,
      createdAt: new Date('2026-07-20'),
      updatedAt: new Date('2026-08-10')
    },
    {
      user: userId,
      userId: userId,
      title: 'Fitness & Hypertrophy Routine',
      content: `### 4-Day Push/Pull/Legs Split\n\n- **Day 1 (Push):** Incline Dumbbell Bench (4x8), Overhead Barbell Press (3x10), Cable Lateral Raises (4x15)\n- **Day 2 (Pull):** Weighted Pull-ups (4x6), Barbell Row (3x8), Face Pulls (4x15)\n- **Day 3 (Legs & Core):** Barbell Squat (4x6), Romanian Deadlift (3x10), Hanging Leg Raises (4x12)\n- **Day 4 (Cardio & Active Recovery):** 8km Zone-2 Trail Run + 20min mobility flow`,
      category: 'Health',
      tags: ['workout', 'gym', 'health'],
      color: '#F59E0B',
      isPinned: false,
      createdAt: new Date('2026-08-01'),
      updatedAt: new Date('2026-08-22')
    },
    {
      user: userId,
      userId: userId,
      title: 'September Project Ideas & Experimentation',
      content: `### Backlog for September 2026\n\n- [ ] Experiment with WebSockets for instant notification chimes\n- [ ] Build offline-first IndexedDB synchronization worker\n- [ ] Test voice-to-text transcription for quick notes\n- [ ] Add biometric WebAuthn passkey support`,
      category: 'Ideas',
      tags: ['brainstorm', 'features', 'next-month'],
      color: '#3B82F6',
      isPinned: false,
      createdAt: new Date('2026-08-24'),
      updatedAt: new Date('2026-08-26')
    }
  ];

  await Note.insertMany(notesData);
  console.log(`[Seed] Created ${notesData.length} Notes.`);

  // ==========================================
  // 4. CALENDAR EVENTS (July, August, September 2026)
  // ==========================================
  const eventsData = [
    // July 2026 Events
    {
      user: userId,
      userId: userId,
      title: 'Q3 Strategic Kickoff Meeting',
      description: 'Executive roadmap presentation and team alignment.',
      startDateTime: new Date('2026-07-06T09:30:00Z'),
      endDateTime: new Date('2026-07-06T11:00:00Z'),
      startTime: new Date('2026-07-06T09:30:00Z'),
      endTime: new Date('2026-07-06T11:00:00Z'),
      category: 'Work',
      location: 'Zoom Conference #804',
      color: '#3B82F6'
    },
    {
      user: userId,
      userId: userId,
      title: 'Database Architecture Review',
      description: 'Deep dive into MongoDB indexing and sharding strategy.',
      startDateTime: new Date('2026-07-15T14:00:00Z'),
      endDateTime: new Date('2026-07-15T15:30:00Z'),
      startTime: new Date('2026-07-15T14:00:00Z'),
      endTime: new Date('2026-07-15T15:30:00Z'),
      category: 'Work',
      location: 'Engineering Hub Room A',
      color: '#8B5CF6'
    },
    {
      user: userId,
      userId: userId,
      title: 'Weekend Trail Run & Picnic',
      description: '10km morning run through Redwood Valley trail.',
      startDateTime: new Date('2026-07-25T07:30:00Z'),
      endDateTime: new Date('2026-07-25T11:00:00Z'),
      startTime: new Date('2026-07-25T07:30:00Z'),
      endTime: new Date('2026-07-25T11:00:00Z'),
      category: 'Personal',
      location: 'Redwood Valley Park',
      color: '#10B981'
    },

    // August 2026 Events (Current Month)
    {
      user: userId,
      userId: userId,
      title: 'Sprint 16 Retrospective & Demo',
      description: 'Demonstrating new OneSpace dark theme and responsive UI.',
      startDateTime: new Date('2026-08-14T15:00:00Z'),
      endDateTime: new Date('2026-08-14T16:30:00Z'),
      startTime: new Date('2026-08-14T15:00:00Z'),
      endTime: new Date('2026-08-14T16:30:00Z'),
      category: 'Work',
      location: 'Google Meet',
      color: '#3B82F6'
    },
    {
      user: userId,
      userId: userId,
      title: '1-on-1 Engineering Mentorship Session',
      description: 'Discussing career growth and distributed systems topics.',
      startDateTime: new Date('2026-08-20T11:00:00Z'),
      endDateTime: new Date('2026-08-20T12:00:00Z'),
      startTime: new Date('2026-08-20T11:00:00Z'),
      endTime: new Date('2026-08-20T12:00:00Z'),
      category: 'Career',
      location: 'Coffee Lounge',
      color: '#8B5CF6'
    },
    {
      user: userId,
      userId: userId,
      title: 'Product Launch Readiness Review',
      description: 'Final security, performance, and UI verification signoff.',
      startDateTime: new Date('2026-08-26T16:00:00Z'),
      endDateTime: new Date('2026-08-26T17:30:00Z'),
      startTime: new Date('2026-08-26T16:00:00Z'),
      endTime: new Date('2026-08-26T17:30:00Z'),
      category: 'Work',
      location: 'Main Boardroom',
      color: '#EF4444'
    },
    {
      user: userId,
      userId: userId,
      title: 'Monthly Financial Audit & Budget Sync',
      description: 'Review August bank statements and balance budget.',
      startDateTime: new Date('2026-08-30T19:00:00Z'),
      endDateTime: new Date('2026-08-30T20:00:00Z'),
      startTime: new Date('2026-08-30T19:00:00Z'),
      endTime: new Date('2026-08-30T20:00:00Z'),
      category: 'Finance',
      location: 'Home Office',
      color: '#10B981'
    },

    // September 2026 Events (Next Month)
    {
      user: userId,
      userId: userId,
      title: 'Q4 Product Roadmap & AI Integration Workshop',
      description: 'Planning major autonomous agent and LLM integration milestones.',
      startDateTime: new Date('2026-09-04T10:00:00Z'),
      endDateTime: new Date('2026-09-04T13:00:00Z'),
      startTime: new Date('2026-09-04T10:00:00Z'),
      endTime: new Date('2026-09-04T13:00:00Z'),
      category: 'Work',
      location: 'Innovation Lab Suite 4',
      color: '#3B82F6'
    },
    {
      user: userId,
      userId: userId,
      title: 'Tech Leaders Annual Summit & Keynote',
      description: 'Keynote by industry visionaries on AI agent orchestration.',
      startDateTime: new Date('2026-09-11T09:00:00Z'),
      endDateTime: new Date('2026-09-11T17:00:00Z'),
      startTime: new Date('2026-09-11T09:00:00Z'),
      endTime: new Date('2026-09-11T17:00:00Z'),
      category: 'Conference',
      location: 'Grand Convention Center',
      color: '#8B5CF6'
    },
    {
      user: userId,
      userId: userId,
      title: 'Team Offsite Hackathon & BBQ',
      description: 'Building innovative internal tools and social team bonding.',
      startDateTime: new Date('2026-09-19T11:00:00Z'),
      endDateTime: new Date('2026-09-19T18:00:00Z'),
      startTime: new Date('2026-09-19T11:00:00Z'),
      endTime: new Date('2026-09-19T18:00:00Z'),
      category: 'Social',
      location: 'Sunset Bay Marina',
      color: '#F59E0B'
    },
    {
      user: userId,
      userId: userId,
      title: 'Bi-Annual Comprehensive Health Screening',
      description: 'Bloodwork, cardiovascular endurance, and body composition analysis.',
      startDateTime: new Date('2026-09-24T08:30:00Z'),
      endDateTime: new Date('2026-09-24T10:00:00Z'),
      startTime: new Date('2026-09-24T08:30:00Z'),
      endTime: new Date('2026-09-24T10:00:00Z'),
      category: 'Health',
      location: 'City Health Medical Plaza',
      color: '#10B981'
    }
  ];

  await Event.insertMany(eventsData);
  console.log(`[Seed] Created ${eventsData.length} Calendar Events across 3 months.`);

  // ==========================================
  // 5. REMINDERS & NOTIFICATIONS
  // ==========================================
  const remindersData = [
    {
      user: userId,
      userId: userId,
      title: 'Submit Q2 Expense Receipts & Tax Deductions',
      reminderDate: new Date('2026-07-15T10:00:00Z'),
      remindAt: new Date('2026-07-15T10:00:00Z'),
      isCompleted: true,
      relatedType: 'custom',
      recurrence: 'none'
    },
    {
      user: userId,
      userId: userId,
      title: 'Pay High-Speed Internet & Cloud Server Invoices',
      reminderDate: new Date('2026-07-28T09:00:00Z'),
      remindAt: new Date('2026-07-28T09:00:00Z'),
      isCompleted: true,
      relatedType: 'custom',
      recurrence: 'monthly'
    },
    {
      user: userId,
      userId: userId,
      title: 'Daily Posture & Hydration Break (Drink 500ml water)',
      reminderDate: new Date('2026-08-26T15:00:00Z'),
      remindAt: new Date('2026-08-26T15:00:00Z'),
      isCompleted: false,
      relatedType: 'fitness',
      recurrence: 'daily'
    },
    {
      user: userId,
      userId: userId,
      title: 'Review Engineering Sprint Demo Pull Requests',
      reminderDate: new Date('2026-08-27T16:00:00Z'),
      remindAt: new Date('2026-08-27T16:00:00Z'),
      isCompleted: false,
      relatedType: 'task',
      recurrence: 'none'
    },
    {
      user: userId,
      userId: userId,
      title: 'Prepare Presentation Slides for Q4 Roadmap',
      reminderDate: new Date('2026-09-03T14:00:00Z'),
      remindAt: new Date('2026-09-03T14:00:00Z'),
      isCompleted: false,
      relatedType: 'task',
      recurrence: 'none'
    },
    {
      user: userId,
      userId: userId,
      title: 'Fasting Bloodwork Prep (No food after 10 PM)',
      reminderDate: new Date('2026-09-23T22:00:00Z'),
      remindAt: new Date('2026-09-23T22:00:00Z'),
      isCompleted: false,
      relatedType: 'fitness',
      recurrence: 'none'
    }
  ];

  await Reminder.insertMany(remindersData);

  const notificationsData = [
    {
      user: userId,
      userId: userId,
      title: 'Goal Milestone Achieved! 🎉',
      message: 'You have surpassed 75% of your "Run 100km in Q3" fitness objective.',
      type: 'goal',
      isRead: false,
      linkUrl: '/goals',
      createdAt: new Date('2026-08-25T19:30:00Z')
    },
    {
      user: userId,
      userId: userId,
      title: 'Dark Navy Theme Active',
      message: 'Your OneSpace workspace has been upgraded with the permanent dark navy aesthetic.',
      type: 'system',
      isRead: true,
      linkUrl: '/',
      createdAt: new Date('2026-08-26T08:00:00Z')
    },
    {
      user: userId,
      userId: userId,
      title: 'Upcoming Event: Product Launch Readiness',
      message: 'Product Launch Readiness Review starts in 1 hour at Main Boardroom.',
      type: 'event',
      isRead: false,
      linkUrl: '/calendar',
      createdAt: new Date('2026-08-26T15:00:00Z')
    },
    {
      user: userId,
      userId: userId,
      title: 'Task Due: Optimize API Response Caching',
      message: 'Task is scheduled for completion by August 28th.',
      type: 'task',
      isRead: true,
      linkUrl: '/tasks',
      createdAt: new Date('2026-08-24T10:00:00Z')
    }
  ];

  await Notification.insertMany(notificationsData);

  // ==========================================
  // 6. DOCUMENTS & LOCKER
  // ==========================================
  const documentsData = [
    {
      user: userId,
      userId: userId,
      originalName: 'OneSpace_SRS_Software_Architecture_v2.pdf',
      fileName: 'onespace_srs_v2.pdf',
      fileUrl: '/uploads/sample_doc.pdf',
      storagePath: path.join(env.UPLOAD_DIR, 'sample_doc.pdf'),
      fileType: 'application/pdf',
      mimeType: 'application/pdf',
      fileSize: 2450000,
      category: 'Work',
      notes: 'Full system architecture, 12 page breakdown, database schemas and UI specifications.',
      tags: ['specs', 'architecture', 'onespace'],
      uploadDate: new Date('2026-08-02')
    },
    {
      user: userId,
      userId: userId,
      originalName: 'Financial_Portfolio_Statement_July2026.pdf',
      fileName: 'financial_statement_july.pdf',
      fileUrl: '/uploads/sample_doc.pdf',
      storagePath: path.join(env.UPLOAD_DIR, 'sample_doc.pdf'),
      fileType: 'application/pdf',
      mimeType: 'application/pdf',
      fileSize: 1120000,
      category: 'Finance',
      notes: 'End-of-month portfolio valuation and dividend summary.',
      tags: ['finance', 'investing', 'tax'],
      uploadDate: new Date('2026-08-01')
    },
    {
      user: userId,
      userId: userId,
      originalName: 'Medical_Checkup_Bloodwork_Report_2026.pdf',
      fileName: 'medical_report_2026.pdf',
      fileUrl: '/uploads/sample_doc.pdf',
      storagePath: path.join(env.UPLOAD_DIR, 'sample_doc.pdf'),
      fileType: 'application/pdf',
      mimeType: 'application/pdf',
      fileSize: 980000,
      category: 'Health',
      notes: 'Biomarkers, lipid profile, and metabolic panel records.',
      tags: ['health', 'medical', 'wellness'],
      uploadDate: new Date('2026-07-22')
    },
    {
      user: userId,
      userId: userId,
      originalName: 'Apartment_Lease_Agreement_2026_2027.pdf',
      fileName: 'lease_agreement.pdf',
      fileUrl: '/uploads/sample_doc.pdf',
      storagePath: path.join(env.UPLOAD_DIR, 'sample_doc.pdf'),
      fileType: 'application/pdf',
      mimeType: 'application/pdf',
      fileSize: 3400000,
      category: 'Personal',
      notes: 'Executed residential lease contract with landlord addendum.',
      tags: ['legal', 'home', 'lease'],
      uploadDate: new Date('2026-07-10')
    }
  ];

  await Document.insertMany(documentsData);

  // ==========================================
  // 7. DAILY ACTIVITIES & FITNESS RECORDS (July 1 to September 30)
  // Generates 90+ consecutive days of rich data!
  // ==========================================
  const dailyActivities = [];
  const fitnessRecords = [];

  const baseWeight = 78.2;
  const standardHabits = [
    { name: 'Read 20 mins of technical book' },
    { name: 'Morning meditation & breathwork' },
    { name: 'Drink 2.5L clean filtered water' },
    { name: 'Hit 10,000 steps' },
    { name: 'Deep work coding session (2 hrs)' },
    { name: 'Evening gratitude journaling' }
  ];

  const workoutTypes = ['Running', 'Strength', 'Cycling', 'HIIT', 'Yoga'];

  // Start from July 1, 2026 to September 30, 2026
  const startDate = new Date('2026-07-01');
  const totalDays = 92; // July (31) + August (31) + September (30)

  for (let i = 0; i < totalDays; i++) {
    const cur = new Date(startDate);
    cur.setDate(cur.getDate() + i);
    const dateString = cur.toISOString().split('T')[0];

    const isPastOrPresent = cur <= new Date('2026-08-26');
    // Numeric mood: 4 (good), 5 (great), 3 (neutral)
    const moodNum = 3 + ((i * 3 + (i % 2)) % 3); // Values: 3, 4, 5
    const sleep = +(6.8 + (Math.sin(i) * 1.1) + 0.3).toFixed(1);
    const steps = Math.floor(8200 + (Math.sin(i * 0.8) * 3500) + (i % 2 === 0 ? 1200 : 0));
    const water = Math.floor(2100 + (Math.cos(i) * 600) + 400);
    const cals = Math.floor(400 + (Math.sin(i * 1.2) * 280) + 150);
    const weight = +(baseWeight - (i * 0.035) + (Math.sin(i) * 0.2)).toFixed(1);

    // Habits completion
    const habitsForDay = standardHabits.map((h, idx) => {
      const isDone = isPastOrPresent ? ((i + idx) % 7 !== 0 && (i + idx) % 11 !== 0) : false;
      return {
        name: h.name,
        isCompleted: isDone,
        status: isDone ? 'done' : 'not done'
      };
    });

    dailyActivities.push({
      user: userId,
      userId: userId,
      date: dateString,
      mood: moodNum,
      energyLevel: moodNum,
      sleepHours: sleep,
      waterIntakeMl: water,
      journalEntry: isPastOrPresent
        ? `Day ${i + 1} focus: High cognitive productivity and consistent daily habit execution.`
        : `Scheduled agenda for ${dateString}.`,
      habits: habitsForDay,
      status: 'done'
    });

    // Workouts (4-5 days a week)
    const hasWorkout = (i % 7 !== 0 && i % 7 !== 4);
    const wType = workoutTypes[i % workoutTypes.length];
    const duration = wType === 'Running' ? 45 : wType === 'Strength' ? 60 : 35;
    const burned = wType === 'Running' ? 420 : wType === 'Strength' ? 380 : 310;

    fitnessRecords.push({
      user: userId,
      userId: userId,
      date: dateString,
      type: hasWorkout ? 'workout' : 'steps',
      workoutType: wType,
      durationMinutes: duration,
      duration: duration,
      caloriesBurned: cals + (hasWorkout ? burned : 0),
      steps: steps,
      bodyWeightKg: weight,
      bodyWeight: weight,
      exercises: hasWorkout && wType === 'Strength' ? [
        { name: 'Barbell Squat', sets: 4, reps: 8, weightKg: 95 },
        { name: 'Incline Bench Press', sets: 4, reps: 10, weightKg: 75 },
        { name: 'Pull-ups', sets: 4, reps: 8, weightKg: 10 }
      ] : [],
      notes: `${wType} session with solid form and target heart-rate maintenance.`
    });
  }

  await DailyActivity.insertMany(dailyActivities);
  await FitnessRecord.insertMany(fitnessRecords);
  console.log(`[Seed] Created ${dailyActivities.length} Daily Activity logs and ${fitnessRecords.length} Fitness Records covering July, August, and September 2026!`);

  console.log(`\n======================================================`);
  console.log(`🎉 SUCCESS: All multi-month data generated for: ${user.name} (${user.email})`);
  console.log(`- 12 Tasks (4 July, 4 August, 4 September)`);
  console.log(`- 5 Notes with Markdown formatting`);
  console.log(`- 11 Calendar Events across July, August, September`);
  console.log(`- 6 Reminders & 4 System Notifications`);
  console.log(`- 4 Uploaded Document Locker files`);
  console.log(`- 92 Daily Activity & Mood Logs (July 1 - Sept 30, 2026)`);
  console.log(`- 92 Fitness Records with Workout Logs & Weight Tracking`);
  console.log(`- 4 Goals with 8 Milestone Progress Updates`);
  console.log(`======================================================\n`);

  await mongoose.disconnect();
}

seedDataForUser('om@gmail.com').catch((err) => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
