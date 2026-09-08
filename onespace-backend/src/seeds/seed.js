const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { connectDB, disconnectDB } = require('../config/db');

// Import all 12 models
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

async function seedDatabase() {
  console.log('====================================================');
  console.log('🚀 Starting OneSpace Master Database Seeding Process');
  console.log('====================================================');

  await connectDB();

  // 1. Prepare sample files in uploads directory
  const uploadsDir = path.resolve(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const sampleFiles = [
    {
      name: 'system-architecture-spec.pdf',
      content: '%PDF-1.4 OneSpace System Architecture Document (Demo Spec Content)'
    },
    {
      name: 'q3-financial-report.pdf',
      content: '%PDF-1.4 OneSpace Q3 2026 Financial & Budget Overview'
    },
    {
      name: 'brand-identity-guidelines.png',
      content: 'PNG_DUMMY_BINARY_DATA_ONESPACE_BRANDING'
    },
    {
      name: 'fullstack-development-cheatsheet.txt',
      content: 'OneSpace FullStack CheatSheet:\n- Frontend: React + Tailwind + Lucide\n- Backend: Node Express + Mongoose + JWT\n- DB: MongoDB'
    }
  ];

  sampleFiles.forEach((file) => {
    const filePath = path.join(uploadsDir, file.name);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, file.content, 'utf-8');
    }
  });

  // 2. Setup Users
  const salt = await bcrypt.genSalt(10);
  const passHash1 = await bcrypt.hash('654321', salt);
  const passHash2 = await bcrypt.hash('password123', salt);

  const usersToSeed = [
    {
      name: 'Prabhakar Pandey',
      email: 'p@gmail.com',
      passwordHash: passHash1,
      bio: 'Full Stack Engineer & Productivity Enthusiast',
      role: 'admin'
    },
    {
      name: 'Demo User',
      email: 'demo@onespace.app',
      passwordHash: passHash2,
      bio: 'OneSpace Demo Account for Testing & Reviews',
      role: 'user'
    }
  ];

  for (const userData of usersToSeed) {
    let user = await User.findOne({ email: userData.email });
    if (!user) {
      user = await User.create(userData);
      console.log(`✔ Created User: ${user.name} (${user.email})`);
    } else {
      user.name = userData.name;
      user.passwordHash = userData.passwordHash;
      user.bio = userData.bio;
      user.role = userData.role;
      await user.save();
      console.log(`✔ Updated User: ${user.name} (${user.email})`);
    }

    const userId = user._id;

    // Clean prior user records
    await Promise.all([
      UserSettings.deleteMany({ $or: [{ user: userId }, { userId: userId }] }),
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

    // 3. UserSettings
    await UserSettings.create({
      user: userId,
      userId: userId,
      theme: 'dark',
      notificationPrefs: {
        email: true,
        push: true,
        sound: true,
        taskReminders: true,
        eventReminders: true,
        goalAlerts: true
      },
      reminderDefaults: {
        defaultMinutesBefore: 15,
        autoSnoozeMinutes: 10
      },
      fitnessPrefs: {
        unit: 'kg',
        dailyStepGoal: 10000,
        dailyWaterGoalMl: 2500
      },
      dataPrefs: {
        autoBackup: true,
        dateFormat: 'YYYY-MM-DD'
      }
    });

    // 4. Goals & Goal Progress
    const goalsData = [
      {
        user: userId,
        userId: userId,
        title: 'Run 100 Kilometers in Q3',
        description: 'Cardiovascular endurance goal across July, August, and September 2026.',
        category: 'Health',
        status: 'active',
        targetDate: new Date('2026-09-30'),
        metrics: { targetValue: 100, currentValue: 78, unit: 'km', startValue: 0 },
        progressPercent: 78,
        color: '#10b981',
        milestones: [
          { title: 'First 25km (Base Endurance)', isCompleted: true, targetDate: new Date('2026-07-25') },
          { title: '50km Halfway Milestone', isCompleted: true, targetDate: new Date('2026-08-15') },
          { title: '75km Milestone', isCompleted: true, targetDate: new Date('2026-08-25') },
          { title: '100km Final Push', isCompleted: false, targetDate: new Date('2026-09-30') }
        ]
      },
      {
        user: userId,
        userId: userId,
        title: 'Read 12 Technical & Leadership Books',
        description: 'Expand knowledge in system design, distributed databases, and high-performing team leadership.',
        category: 'Personal',
        status: 'active',
        targetDate: new Date('2026-12-31'),
        metrics: { targetValue: 12, currentValue: 8, unit: 'books', startValue: 0 },
        progressPercent: 67,
        color: '#8b5cf6',
        milestones: [
          { title: 'Designing Data-Intensive Applications', isCompleted: true },
          { title: 'Clean Architecture (Martin)', isCompleted: true },
          { title: 'System Design Interview (Alex Xu)', isCompleted: true },
          { title: 'Staff Engineer (Will Larson)', isCompleted: true },
          { title: 'Site Reliability Engineering (Google)', isCompleted: false }
        ]
      },
      {
        user: userId,
        userId: userId,
        title: 'Save $10,000 Emergency Fund',
        description: 'Automate monthly savings and cut discretionary spending to build safety cushion.',
        category: 'Finance',
        status: 'active',
        targetDate: new Date('2026-10-31'),
        metrics: { targetValue: 10000, currentValue: 8200, unit: 'USD', startValue: 2000 },
        progressPercent: 82,
        color: '#f59e0b',
        milestones: [
          { title: 'Reach $4,000 Milestone', isCompleted: true },
          { title: 'Reach $7,000 Milestone', isCompleted: true },
          { title: 'Hit $10,000 Goal', isCompleted: false }
        ]
      },
      {
        user: userId,
        userId,
        title: 'Master Cloud Native DevOps & Microservices',
        description: 'Production containerization, Kubernetes orchestration, and automated CI/CD.',
        category: 'Career',
        status: 'completed',
        targetDate: new Date('2026-08-20'),
        metrics: { targetValue: 100, currentValue: 100, unit: '%', startValue: 0 },
        progressPercent: 100,
        color: '#3b82f6',
        milestones: [
          { title: 'Docker multi-stage builds', isCompleted: true },
          { title: 'K8s pods, deployments & ingress', isCompleted: true },
          { title: 'GitHub Actions CI/CD pipelines', isCompleted: true }
        ]
      }
    ];

    const createdGoals = await Goal.insertMany(goalsData);

    const goalProgressList = [
      { goal: createdGoals[0]._id, goalId: createdGoals[0]._id, user: userId, userId, date: new Date('2026-07-15'), valueAdded: 25, currentTotal: 25, note: 'Completed first 25km base endurance runs' },
      { goal: createdGoals[0]._id, goalId: createdGoals[0]._id, user: userId, userId, date: new Date('2026-08-01'), valueAdded: 25, currentTotal: 50, note: 'Hit 50km milestone halfway mark' },
      { goal: createdGoals[0]._id, goalId: createdGoals[0]._id, user: userId, userId, date: new Date('2026-08-22'), valueAdded: 28, currentTotal: 78, note: 'Great morning 10k run, now at 78km' },
      { goal: createdGoals[1]._id, goalId: createdGoals[1]._id, user: userId, userId, date: new Date('2026-07-20'), valueAdded: 3, currentTotal: 3, note: 'Finished 3 technical architecture books' },
      { goal: createdGoals[1]._id, goalId: createdGoals[1]._id, user: userId, userId, date: new Date('2026-08-10'), valueAdded: 3, currentTotal: 6, note: 'Finished Clean Architecture & SRE books' },
      { goal: createdGoals[1]._id, goalId: createdGoals[1]._id, user: userId, userId, date: new Date('2026-08-24'), valueAdded: 2, currentTotal: 8, note: 'Finished Staff Engineer by Will Larson' },
      { goal: createdGoals[2]._id, goalId: createdGoals[2]._id, user: userId, userId, date: new Date('2026-07-31'), valueAdded: 2000, currentTotal: 4000, note: 'July monthly savings deposit' },
      { goal: createdGoals[2]._id, goalId: createdGoals[2]._id, user: userId, userId, date: new Date('2026-08-15'), valueAdded: 4200, currentTotal: 8200, note: 'Mid-quarter bonus allocation' }
    ];
    await GoalProgress.insertMany(goalProgressList);

    // 5. Tasks (Multi-Month: July, August, September 2026)
    const tasksData = [
      // Past / Completed (July 2026)
      {
        user: userId,
        userId,
        title: 'Draft System Architecture & Data Schema',
        description: 'Complete high-level ERD and API specifications for OneSpace platform.',
        status: 'completed',
        priority: 'urgent',
        dueDate: new Date('2026-07-10T18:00:00.000Z'),
        dueTime: '18:00',
        tags: ['Architecture', 'Design', 'Backend'],
        estimatedMinutes: 240,
        completedAt: new Date('2026-07-09T16:30:00.000Z'),
        subtasks: [
          { title: 'Define Mongoose models', isCompleted: true },
          { title: 'Design RESTful API routes', isCompleted: true },
          { title: 'Review JWT auth workflow', isCompleted: true }
        ]
      },
      {
        user: userId,
        userId,
        title: 'Implement JWT Auth & Middleware Stack',
        description: 'Set up bcrypt password hashing, access & refresh token rotation, and auth guard.',
        status: 'completed',
        priority: 'high',
        dueDate: new Date('2026-07-18T17:00:00.000Z'),
        dueTime: '17:00',
        tags: ['Security', 'Auth', 'Backend'],
        estimatedMinutes: 180,
        completedAt: new Date('2026-07-17T15:20:00.000Z'),
        subtasks: [
          { title: 'Token generator utils', isCompleted: true },
          { title: 'Auth protect middleware', isCompleted: true },
          { title: 'Error handling middleware', isCompleted: true }
        ]
      },
      {
        user: userId,
        userId,
        title: 'Initial Frontend Dashboard UI Wireframes',
        description: 'Build React components for stats cards, task list preview, and quick action bar.',
        status: 'completed',
        priority: 'medium',
        dueDate: new Date('2026-07-28T19:00:00.000Z'),
        dueTime: '19:00',
        tags: ['Frontend', 'UI/UX', 'React'],
        estimatedMinutes: 150,
        completedAt: new Date('2026-07-27T18:45:00.000Z'),
        subtasks: [
          { title: 'Metric counter cards', isCompleted: true },
          { title: 'Responsive grid layout', isCompleted: true }
        ]
      },

      // August 2026 (Current Month)
      {
        user: userId,
        userId,
        title: 'Deliver Habit Tracker & Mood Heatmap Module',
        description: 'Interactive habit checklist with multi-month visual heatmap and mood logging.',
        status: 'completed',
        priority: 'high',
        dueDate: new Date('2026-08-12T18:00:00.000Z'),
        dueTime: '18:00',
        tags: ['Habits', 'Analytics', 'Fullstack'],
        estimatedMinutes: 200,
        completedAt: new Date('2026-08-11T14:10:00.000Z'),
        subtasks: [
          { title: 'Heatmap aggregation backend', isCompleted: true },
          { title: 'Habit checkmark toggle API', isCompleted: true },
          { title: 'Streak calculation logic', isCompleted: true }
        ]
      },
      {
        user: userId,
        userId,
        title: 'Fitness & Workout Analytics Dashboard',
        description: 'Workout logging with exercise sets, reps, weight tracking, and calorie burned graphs.',
        status: 'in_progress',
        priority: 'urgent',
        dueDate: new Date('2026-08-27T18:00:00.000Z'),
        dueTime: '18:00',
        tags: ['Fitness', 'Charts', 'Frontend'],
        estimatedMinutes: 160,
        subtasks: [
          { title: 'Weight progression chart', isCompleted: true },
          { title: 'Workout set logger modal', isCompleted: true },
          { title: 'Calorie aggregate metric cards', isCompleted: false }
        ]
      },
      {
        user: userId,
        userId,
        title: 'Secure Document Vault & File Storage API',
        description: 'Multer file upload with mimeType validation, storage handling, and document preview.',
        status: 'in_progress',
        priority: 'medium',
        dueDate: new Date('2026-08-28T20:00:00.000Z'),
        dueTime: '20:00',
        tags: ['Documents', 'Storage', 'Backend'],
        estimatedMinutes: 120,
        subtasks: [
          { title: 'Multer disk storage engine', isCompleted: true },
          { title: 'Download & inline view stream', isCompleted: false },
          { title: 'Document category filters', isCompleted: true }
        ]
      },
      {
        user: userId,
        userId,
        title: 'Overdue: Review Server Backup & Index Optimization',
        description: 'Verify MongoDB compound index efficiency and automate scheduled backup dump.',
        status: 'overdue',
        priority: 'high',
        dueDate: new Date('2026-08-20T12:00:00.000Z'),
        dueTime: '12:00',
        tags: ['Database', 'DevOps', 'Performance'],
        estimatedMinutes: 90,
        subtasks: [
          { title: 'Explain query plan on DailyActivity', isCompleted: true },
          { title: 'Configure auto-dump cron job', isCompleted: false }
        ]
      },
      {
        user: userId,
        userId,
        title: 'Weekly Expense Budget Reconciliation',
        description: 'Review August categorized expenses against monthly $3,000 threshold budget.',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date('2026-08-30T17:00:00.000Z'),
        dueTime: '17:00',
        tags: ['Finance', 'Budgeting'],
        estimatedMinutes: 60,
        subtasks: [
          { title: 'Review Food & Grocery totals', isCompleted: false },
          { title: 'Export monthly CSV summary', isCompleted: false }
        ]
      },

      // September 2026 (Future Month)
      {
        user: userId,
        userId,
        title: 'Implement Dark Mode Glassmorphism Theme Overhaul',
        description: 'Refine Tailwind color variables and CSS backdrop-blur tokens for dark aesthetic.',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date('2026-09-08T18:00:00.000Z'),
        dueTime: '18:00',
        tags: ['Design', 'Tailwind', 'CSS'],
        estimatedMinutes: 120,
        subtasks: [
          { title: 'Color palette tokens', isCompleted: false },
          { title: 'Glow accents and borders', isCompleted: false }
        ]
      },
      {
        user: userId,
        userId,
        title: 'Q3 Product Release & Live Cloud Deployment',
        description: 'Complete container deployment on AWS ECS with custom domain and SSL certificates.',
        status: 'pending',
        priority: 'urgent',
        dueDate: new Date('2026-09-20T16:00:00.000Z'),
        dueTime: '16:00',
        tags: ['DevOps', 'Release', 'Cloud'],
        estimatedMinutes: 300,
        subtasks: [
          { title: 'Docker image tagging', isCompleted: false },
          { title: 'Configure DNS and CloudFront CDN', isCompleted: false },
          { title: 'Load testing & stress benchmarks', isCompleted: false }
        ]
      },
      {
        user: userId,
        userId,
        title: 'Global Search Keyboard Shortcut (Cmd+K)',
        description: 'Omni-search modal with fuzzy match across Tasks, Notes, Events, and Documents.',
        status: 'pending',
        priority: 'low',
        dueDate: new Date('2026-09-25T15:00:00.000Z'),
        dueTime: '15:00',
        tags: ['Frontend', 'Search', 'UX'],
        estimatedMinutes: 90,
        subtasks: [
          { title: 'Keyboard listener hook', isCompleted: false },
          { title: 'Search result grouped list', isCompleted: false }
        ]
      },
      {
        user: userId,
        userId,
        title: 'End of Q3 Personal Retrospective & OKR Scoring',
        description: 'Evaluate Q3 metrics for fitness, book reading, and savings achievements.',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date('2026-09-30T19:00:00.000Z'),
        dueTime: '19:00',
        tags: ['Personal', 'Review', 'Goals'],
        estimatedMinutes: 90,
        subtasks: [
          { title: 'Calculate final 100km total', isCompleted: false },
          { title: 'Draft Q4 2026 OKR roadmap', isCompleted: false }
        ]
      }
    ];

    await Task.insertMany(tasksData);

    // 6. Notes (Rich Markdown content)
    const notesData = [
      {
        user: userId,
        userId,
        title: 'OneSpace System Architecture & Tech Stack',
        category: 'Architecture',
        isPinned: true,
        color: '#6366f1',
        tags: ['Architecture', 'TechStack', 'NodeJS'],
        description: 'Comprehensive high-level architecture overview of the OneSpace Unified System.',
        content: `# OneSpace System Architecture

## Overview
OneSpace is a high-performance personal operating system designed to unite productivity, task management, calendar scheduling, fitness records, and daily habits in a single intuitive workspace.

### Core Stack
- **Frontend**: React 18 / 19, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Node.js, Express.js REST API
- **Database**: MongoDB via Mongoose ORM
- **Security**: JWT Authentication (Access + Refresh token rotation), bcrypt password hashing

### Micro-Services & Modules
1. **Task Execution Engine**: Priority queues, subtasks, deadline notifications
2. **Habit & Activity Matrix**: Continuous streak tracking and multi-month heatmap
3. **Fitness Hub**: Weight tracking, calorie budgeting, and strength exercise sets
4. **Document Locker**: Multi-format vault with tag indexing`
      },
      {
        user: userId,
        userId,
        title: 'Q3 2026 Strategic Milestones & OKRs',
        category: 'Personal',
        isPinned: true,
        color: '#ec4899',
        tags: ['OKRs', 'Strategy', 'Q3'],
        description: 'Key performance objectives for July, August, and September 2026.',
        content: `# Q3 2026 Personal Strategic Plan

## Primary Objectives
1. **Health & Fitness**: Run 100km total across Q3 (Current: 78km).
2. **Knowledge Expansion**: Read 12 technical and leadership books (Current: 8 books).
3. **Financial Discipline**: Accumulate $10,000 in emergency reserves (Current: $8,200).
4. **Career Growth**: Ship production-grade fullstack web applications with 100% test coverage.

> "Discipline equals freedom." — Jocko Willink`
      },
      {
        user: userId,
        userId,
        title: 'Advanced React State Patterns & Performance',
        category: 'Work',
        isPinned: false,
        color: '#3b82f6',
        tags: ['React', 'Performance', 'JavaScript'],
        description: 'Optimizing React rendering with memoization, virtualized lists, and atomic state.',
        content: `# React Performance Optimization Guidelines

- **Memoization**: Use \`useMemo\` and \`useCallback\` on heavy calculations and callback props passed to children.
- **Virtualized Lists**: Implement \`react-window\` for lists exceeding 100 items.
- **State Colocation**: Keep state as close as possible to the components that consume it.
- **Optimistic UI Updates**: Update local UI state immediately while HTTP mutations resolve in the background.`
      },
      {
        user: userId,
        userId,
        title: 'Building Unbreakable Habits: The 4-Step Loop',
        category: 'Health',
        isPinned: false,
        color: '#10b981',
        tags: ['Habits', 'Psychology', 'Productivity'],
        description: 'Cue, Craving, Response, Reward framework for daily routine optimization.',
        content: `# The 4 Laws of Habit Formation (James Clear)

1. **Make it Obvious**: Visual cues in the environment (e.g. running shoes next to bed).
2. **Make it Attractive**: Habit stacking with rewarding activities.
3. **Make it Easy**: Reduce friction (2-minute rule).
4. **Make it Satisfying**: Immediate visual feedback (check off habits on OneSpace Heatmap).`
      },
      {
        user: userId,
        userId,
        title: 'Sprint Retrospective & Team Action Items',
        category: 'Work',
        isPinned: false,
        color: '#f59e0b',
        tags: ['Scrum', 'Retrospective', 'Work'],
        description: 'Team retrospective takeaways on sprint velocity and code reviews.',
        content: `# Sprint Retrospective Summary

### What went well:
- Shipped 14 backend API endpoints ahead of schedule.
- Zero downtime database migrations.

### Areas for improvement:
- Increase automated integration test coverage to >90%.
- Streamline PR review turnaround time to under 4 hours.`
      },
      {
        user: userId,
        userId,
        title: 'Future Innovation Sandbox & Feature Ideas',
        category: 'Ideas',
        isPinned: false,
        color: '#8b5cf6',
        tags: ['Ideas', 'Roadmap', 'AI'],
        description: 'Exploratory concepts for AI productivity assistance and automated analytics.',
        content: `# Future OneSpace Innovation Concepts

- **AI Daily Briefing**: Automated morning summary synthesizing tasks, weather, calendar, and habit streaks.
- **Smart Natural Language Parser**: "Meeting with Sarah tomorrow at 3pm" automatically parsed into Calendar Event with Reminder.
- **Wearable Device Sync**: HealthKit and Google Fit integration for automatic step and calorie synchronization.`
      }
    ];

    await Note.insertMany(notesData);

    // 7. Calendar Events (Multi-Month: July, August, September 2026)
    const eventsData = [
      // July 2026
      {
        user: userId,
        userId,
        title: 'Q3 Product Roadmap Kickoff',
        description: 'Strategic alignment meeting with engineering leads and designers.',
        startDateTime: new Date('2026-07-06T10:00:00.000Z'),
        endDateTime: new Date('2026-07-06T11:30:00.000Z'),
        location: 'Virtual / Zoom Room Alpha',
        category: 'Work',
        color: '#4f46e5',
        reminderMinutesBefore: 15
      },
      {
        user: userId,
        userId,
        title: 'Database Architecture Review',
        description: 'Review indexing strategy and Mongoose data access patterns.',
        startDateTime: new Date('2026-07-16T14:00:00.000Z'),
        endDateTime: new Date('2026-07-16T15:30:00.000Z'),
        location: 'Conference Room 3B',
        category: 'Work',
        color: '#3b82f6',
        reminderMinutesBefore: 30
      },
      {
        user: userId,
        userId,
        title: 'Summer 10K Marathon Run',
        description: 'City park 10K running event for Q3 health milestone.',
        startDateTime: new Date('2026-07-26T07:00:00.000Z'),
        endDateTime: new Date('2026-07-26T09:00:00.000Z'),
        location: 'Central Riverside Park',
        category: 'Health',
        color: '#10b981',
        reminderMinutesBefore: 60
      },

      // August 2026
      {
        user: userId,
        userId,
        title: 'Frontend Component Library Review',
        description: 'Review reusable design tokens, modal dialogs, and navigation drawer.',
        startDateTime: new Date('2026-08-08T11:00:00.000Z'),
        endDateTime: new Date('2026-08-08T12:00:00.000Z'),
        location: 'Zoom Tech Hub',
        category: 'Work',
        color: '#4f46e5',
        reminderMinutesBefore: 15
      },
      {
        user: userId,
        userId,
        title: 'Bi-Weekly 1-on-1 Engineering Mentorship',
        description: 'Career progression check-in, code review feedback, and skill development.',
        startDateTime: new Date('2026-08-18T15:00:00.000Z'),
        endDateTime: new Date('2026-08-18T16:00:00.000Z'),
        location: 'Office Lounge',
        category: 'Work',
        color: '#6366f1',
        reminderMinutesBefore: 15
      },
      {
        user: userId,
        userId,
        title: 'Full Body Strength & Conditioning',
        description: 'Heavy squats, incline bench press, and pull-up workout.',
        startDateTime: new Date('2026-08-26T17:30:00.000Z'),
        endDateTime: new Date('2026-08-26T18:45:00.000Z'),
        location: 'Equinox Gym Downtown',
        category: 'Health',
        color: '#10b981',
        reminderMinutesBefore: 30
      },
      {
        user: userId,
        userId,
        title: 'Sprint 14 Demo & Stakeholder Walkthrough',
        description: 'Demonstrate live features: Habits heatmap, multi-month analytics, and document vault.',
        startDateTime: new Date('2026-08-28T14:00:00.000Z'),
        endDateTime: new Date('2026-08-28T15:00:00.000Z'),
        location: 'Main Auditorium & Stream',
        category: 'Work',
        color: '#ec4899',
        reminderMinutesBefore: 15
      },
      {
        user: userId,
        userId,
        title: 'Weekend Family Dinner & Celebration',
        description: 'Celebrate completed milestones and family birthday.',
        startDateTime: new Date('2026-08-30T19:00:00.000Z'),
        endDateTime: new Date('2026-08-30T22:00:00.000Z'),
        location: 'Harbor View Bistro',
        category: 'Personal',
        color: '#f59e0b',
        reminderMinutesBefore: 60
      },

      // September 2026
      {
        user: userId,
        userId,
        title: 'Cloud Infrastructure & Security Audit',
        description: 'Penetration testing, token expiry validation, and rate limiter stress tests.',
        startDateTime: new Date('2026-09-07T13:00:00.000Z'),
        endDateTime: new Date('2026-09-07T15:00:00.000Z'),
        location: 'Security Operations Hub',
        category: 'Work',
        color: '#ef4444',
        reminderMinutesBefore: 30
      },
      {
        user: userId,
        userId,
        title: 'Annual Tech Summit 2026',
        description: 'Keynotes on Distributed AI Agents, Cloud Native Scaling, and Next-Gen Web UI.',
        startDateTime: new Date('2026-09-17T09:00:00.000Z'),
        endDateTime: new Date('2026-09-18T17:00:00.000Z'),
        allDay: true,
        location: 'Metropolitan Convention Center',
        category: 'Career',
        color: '#8b5cf6',
        reminderMinutesBefore: 120
      },
      {
        user: userId,
        userId,
        title: 'Quarterly Executive Review & Q4 Planning',
        description: 'Review Q3 achievements against OKRs and finalize Q4 strategic budget.',
        startDateTime: new Date('2026-09-29T10:00:00.000Z'),
        endDateTime: new Date('2026-09-29T12:30:00.000Z'),
        location: 'Executive Boardroom',
        category: 'Work',
        color: '#4f46e5',
        reminderMinutesBefore: 30
      }
    ];

    await Event.insertMany(eventsData);

    // 8. Reminders
    const remindersData = [
      {
        user: userId,
        userId,
        title: 'Drink 500ml hydration water',
        relatedType: 'fitness',
        reminderDate: new Date('2026-08-26T09:00:00.000Z'),
        reminderTime: '09:00',
        recurrence: 'daily',
        isCompleted: true,
        isTriggered: true
      },
      {
        user: userId,
        userId,
        title: 'Take Multivitamins & Omega-3',
        relatedType: 'fitness',
        reminderDate: new Date('2026-08-26T12:30:00.000Z'),
        reminderTime: '12:30',
        recurrence: 'daily',
        isCompleted: true,
        isTriggered: true
      },
      {
        user: userId,
        userId,
        title: 'Review Sprint PRs before 5 PM',
        relatedType: 'task',
        reminderDate: new Date('2026-08-26T16:30:00.000Z'),
        reminderTime: '16:30',
        recurrence: 'none',
        isCompleted: false,
        isTriggered: false
      },
      {
        user: userId,
        userId,
        title: 'Evening 15-minute stretching & mobility',
        relatedType: 'fitness',
        reminderDate: new Date('2026-08-26T21:00:00.000Z'),
        reminderTime: '21:00',
        recurrence: 'daily',
        isCompleted: false,
        isTriggered: false
      },
      {
        user: userId,
        userId,
        title: 'Submit Monthly Expense Invoices',
        relatedType: 'custom',
        reminderDate: new Date('2026-08-31T10:00:00.000Z'),
        reminderTime: '10:00',
        recurrence: 'monthly',
        isCompleted: false,
        isTriggered: false
      },
      {
        user: userId,
        userId,
        title: 'Check Q3 100km Running Goal Progress',
        relatedType: 'goal',
        reminderDate: new Date('2026-09-01T09:00:00.000Z'),
        reminderTime: '09:00',
        recurrence: 'weekly',
        isCompleted: false,
        isTriggered: false
      }
    ];

    await Reminder.insertMany(remindersData);

    // 9. Notifications (Read & Unread)
    const notificationsData = [
      {
        user: userId,
        userId,
        title: 'Goal Progress Milestone Reached!',
        message: 'Congratulations! You reached 78km of your 100km Q3 Running Goal.',
        type: 'goal',
        sourceType: 'goal',
        isRead: false,
        linkUrl: '/goals'
      },
      {
        user: userId,
        userId,
        title: 'Task Due Reminder',
        message: 'Fitness & Workout Analytics Dashboard is due tomorrow.',
        type: 'task',
        sourceType: 'task',
        isRead: false,
        linkUrl: '/tasks'
      },
      {
        user: userId,
        userId,
        title: 'Habit Streak: 14 Days Active',
        message: 'You have logged continuous daily habits for 14 straight days. Keep it going!',
        type: 'fitness',
        sourceType: 'habit',
        isRead: true,
        linkUrl: '/daily-activity'
      },
      {
        user: userId,
        userId,
        title: 'Security Alert: New Sign-in',
        message: 'Your account was accessed from OneSpace Web Client on Windows.',
        type: 'system',
        sourceType: 'system',
        isRead: true,
        linkUrl: '/settings'
      },
      {
        user: userId,
        userId,
        title: 'Upcoming Calendar Event',
        message: 'Full Body Strength & Conditioning starts in 30 minutes.',
        type: 'event',
        sourceType: 'calendar',
        isRead: true,
        linkUrl: '/calendar'
      }
    ];

    await Notification.insertMany(notificationsData);

    // 10. Documents (Document Locker Vault)
    const documentsData = [
      {
        user: userId,
        userId,
        fileName: 'system-architecture-spec.pdf',
        originalName: 'OneSpace-System-Architecture-Spec-v1.pdf',
        fileSize: 53897,
        fileType: 'application/pdf',
        mimeType: 'application/pdf',
        storagePath: 'uploads/system-architecture-spec.pdf',
        category: 'Architecture',
        tags: ['Specification', 'Backend', 'System Design'],
        notes: 'Official architecture specifications detailing data schemas, API routes, and cache layers.',
        uploadDate: new Date('2026-07-15T10:30:00.000Z')
      },
      {
        user: userId,
        userId,
        fileName: 'q3-financial-report.pdf',
        originalName: 'Q3-2026-Financial-Budget-Overview.pdf',
        fileSize: 42150,
        fileType: 'application/pdf',
        mimeType: 'application/pdf',
        storagePath: 'uploads/q3-financial-report.pdf',
        category: 'Finance',
        tags: ['Budget', 'Q3', 'Taxes', 'Savings'],
        notes: 'Monthly expense categorizations, savings projections, and emergency fund analysis.',
        uploadDate: new Date('2026-08-01T14:15:00.000Z')
      },
      {
        user: userId,
        userId,
        fileName: 'brand-identity-guidelines.png',
        originalName: 'OneSpace-Brand-Identity-Assets.png',
        fileSize: 128450,
        fileType: 'image/png',
        mimeType: 'image/png',
        storagePath: 'uploads/brand-identity-guidelines.png',
        category: 'Design',
        tags: ['Branding', 'Logos', 'Color Palette'],
        notes: 'Color HEX codes, typography pairings (Outfit & Inter), and UI icon guidelines.',
        uploadDate: new Date('2026-08-10T09:45:00.000Z')
      },
      {
        user: userId,
        userId,
        fileName: 'fullstack-development-cheatsheet.txt',
        originalName: 'Fullstack-Modern-Web-Cheatsheet.txt',
        fileSize: 1024,
        fileType: 'text/plain',
        mimeType: 'text/plain',
        storagePath: 'uploads/fullstack-development-cheatsheet.txt',
        category: 'General',
        tags: ['Cheatsheet', 'Dev', 'Productivity'],
        notes: 'Quick reference CLI commands, Docker compose snippets, and MongoDB shell tips.',
        uploadDate: new Date('2026-08-20T16:00:00.000Z')
      }
    ];

    await Document.insertMany(documentsData);

    // 11. Multi-Month Daily Activity & Fitness Records (July 1 - Sept 30, 2026: 92 days)
    const startDate = new Date('2026-07-01');
    const totalDays = 92; // July(31) + August(31) + Sept(30)
    const baseWeight = 77.8;

    const sampleExpenseCatalog = [
      { description: 'Fresh Produce & Groceries', amount: 84.50, category: 'Food' },
      { description: 'Team Lunch & Artisan Coffee', amount: 24.50, category: 'Food' },
      { description: 'Metro Pass & Commute', amount: 35.00, category: 'Transport' },
      { description: 'High-Speed Fiber Internet Bill', amount: 65.00, category: 'Bills' },
      { description: 'Electricity & Utilities', amount: 95.00, category: 'Bills' },
      { description: 'Gym & Fitness Membership', amount: 50.00, category: 'Health' },
      { description: 'Cloud Server & Domain Hosting', amount: 35.00, category: 'Bills' },
      { description: 'Architecture & System Design Books', amount: 48.00, category: 'Shopping' },
      { description: 'Weekend Cinema & Dinner', amount: 62.00, category: 'Entertainment' },
      { description: 'Hardware Accessories & Ergonomic Mouse', amount: 79.00, category: 'Shopping' }
    ];

    const standardHabits = [
      'Morning Workout / Run',
      'Drink 2.5L Water',
      'Deep Work Session (2h)',
      'Read 25 Pages',
      'Meditation & Mindfulness'
    ];

    const workoutTypes = ['Running', 'Strength', 'HIIT', 'Cycling', 'Yoga', 'Strength'];

    const dailyActivities = [];
    const fitnessRecords = [];

    for (let i = 0; i < totalDays; i++) {
      const cur = new Date(startDate);
      cur.setDate(cur.getDate() + i);
      const dateString = cur.toISOString().split('T')[0];
      const isPastOrToday = cur <= new Date('2026-08-26');

      // Mood: 3 (neutral), 4 (good), 5 (great)
      const moodScore = 3 + ((i * 3 + (i % 2)) % 3);
      const sleep = +(6.8 + Math.sin(i * 0.7) * 1.1 + 0.3).toFixed(1);
      const steps = Math.floor(8400 + Math.sin(i * 0.8) * 3200 + (i % 2 === 0 ? 1500 : 0));
      const water = Math.floor(2200 + Math.cos(i) * 500 + 300);
      const cals = Math.floor(420 + Math.sin(i * 1.2) * 260 + 150);
      const weight = +(baseWeight - i * 0.045 + Math.sin(i) * 0.15).toFixed(1);

      // Habits
      const habitsForDay = standardHabits.map((hName, idx) => {
        const isDone = isPastOrToday ? ((i + idx) % 7 !== 0 && (i + idx) % 11 !== 0) : false;
        return {
          name: hName,
          isCompleted: isDone,
          status: isDone ? 'done' : 'not done'
        };
      });

      // Expenses (every 2-3 days)
      const dayExpenses = [];
      if (isPastOrToday && i % 2 === 0) {
        const exp1 = sampleExpenseCatalog[i % sampleExpenseCatalog.length];
        dayExpenses.push({
          description: exp1.description,
          amount: +(exp1.amount + (i % 12)).toFixed(2),
          category: exp1.category,
          date: dateString
        });
        if (i % 4 === 0) {
          const exp2 = sampleExpenseCatalog[(i + 4) % sampleExpenseCatalog.length];
          dayExpenses.push({
            description: exp2.description,
            amount: +(exp2.amount + (i % 8)).toFixed(2),
            category: exp2.category,
            date: dateString
          });
        }
      }

      dailyActivities.push({
        user: userId,
        userId: userId,
        date: dateString,
        mood: moodScore,
        energyLevel: moodScore,
        sleepHours: sleep,
        waterIntakeMl: water,
        journalEntry: isPastOrToday
          ? `Day ${i + 1} Log: Focused work execution, consistent hydration, and steady progress on Q3 objectives.`
          : `Planned agenda for ${dateString}.`,
        habits: habitsForDay,
        expenses: dayExpenses,
        status: isPastOrToday ? 'done' : 'pending'
      });

      // Workouts (5 days a week)
      const hasWorkout = (i % 7 !== 0 && i % 7 !== 4);
      const wType = workoutTypes[i % workoutTypes.length];
      const duration = wType === 'Running' ? 45 : wType === 'Strength' ? 60 : wType === 'HIIT' ? 35 : 50;
      const burned = wType === 'Running' ? 450 : wType === 'Strength' ? 400 : wType === 'HIIT' ? 360 : 300;

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
          { name: 'Barbell Back Squat', sets: 4, reps: 8, weightKg: 95 },
          { name: 'Flat Barbell Bench Press', sets: 4, reps: 10, weightKg: 80 },
          { name: 'Weighted Pull-ups', sets: 4, reps: 8, weightKg: 15 },
          { name: 'Overhead Shoulder Press', sets: 3, reps: 10, weightKg: 50 }
        ] : [],
        notes: isPastOrToday ? `${wType} session completed with high energy and proper hydration.` : `Scheduled ${wType} session.`
      });
    }

    await DailyActivity.insertMany(dailyActivities);
    await FitnessRecord.insertMany(fitnessRecords);

    console.log(`\n======================================================`);
    console.log(`🎉 SUCCESS: All Pre-Data Generated for: ${user.name} (${user.email})`);
    console.log(`- 12 Tasks (July, August, September 2026) with priorities & subtasks`);
    console.log(`- 6 Rich Markdown Notes with color coding and tags`);
    console.log(`- 11 Calendar Events spanning July, August, September 2026`);
    console.log(`- 6 Reminders & 5 System Notifications`);
    console.log(`- 4 Document Locker items with physical uploads`);
    console.log(`- 92 Daily Activity logs (July 1 - Sept 30) with habits & categorized expenses`);
    console.log(`- 92 Fitness Records with workout logs & weight tracking`);
    console.log(`- 4 Goals with 8 Milestone Progress Updates`);
    console.log(`======================================================\n`);
  }

  console.log('✅ ALL DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  await disconnectDB();
}

if (require.main === module) {
  seedDatabase().catch(async (err) => {
    console.error('❌ Database Seeding Error:', err);
    await disconnectDB();
    process.exit(1);
  });
}

module.exports = { seedDatabase };
