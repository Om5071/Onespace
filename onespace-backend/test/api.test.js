const http = require('http');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const app = require('../src/app');
const { connectDB } = require('../src/config/db');

// Models
const User = require('../src/models/User');
const Notification = require('../src/models/Notification');

let server;
let baseUrl;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (!condition) {
    failedTests++;
    console.error(`  ❌ FAILED: ${message}`);
    throw new Error(`Assertion Failed: ${message}`);
  }
  passedTests++;
  console.log(`  ✔ PASSED: ${message}`);
}

async function apiRequest(endpoint, { method = 'GET', body = null, token = null, isFormData = false } = {}) {
  const url = `${baseUrl}${endpoint}`;
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };

  if (body) {
    if (isFormData) {
      options.body = body; // Native FormData
    } else {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
  }

  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') || '';
  let data;

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return {
    status: response.status,
    ok: response.ok,
    headers: response.headers,
    data
  };
}

async function runEndpointTestSuite() {
  console.log('===============================================================');
  console.log('🧪 Starting OneSpace Comprehensive HTTP Endpoint Test Suite');
  console.log('===============================================================\n');

  try {
    await connectDB();

    // Start ephemeral Express HTTP server
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        console.log(`✔ Ephemeral test server active at: ${baseUrl}\n`);
        resolve();
      });
    });

    let primaryToken = '';
    let refreshTokenVal = '';
    let testUserEmail = `test_engineer_${Date.now()}@onespace.app`;
    let testUserId = '';
    let sampleTaskId = '';
    let sampleNoteId = '';
    let sampleEventId = '';
    let sampleReminderId = '';
    let sampleNotificationId = '';
    let sampleDocumentId = '';
    let sampleActivityId = '';
    let sampleFitnessId = '';
    let sampleGoalId = '';
    const todayStr = new Date().toISOString().split('T')[0];

    // ============================================================
    // 1. HEALTH CHECK SUITE
    // ============================================================
    console.log('▶ SUITE 1: System Health & Base Configuration');
    {
      const res = await apiRequest('/api/health');
      assert(res.status === 200, 'GET /api/health returns 200 OK');
      assert(res.data?.status === 'online', 'Health status reports "online"');
      assert(res.data?.service === 'OneSpace Backend API', 'Service identifier matches OneSpace Backend API');
    }

    // ============================================================
    // 2. AUTHENTICATION & SESSION SUITE
    // ============================================================
    console.log('\n▶ SUITE 2: Authentication, Registration & Session Tokens');
    {
      // 2.1 Register New Account
      const regRes = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Alex Rivera',
          email: testUserEmail,
          password: 'Password123!'
        }
      });
      assert(regRes.status === 201, 'POST /api/auth/register returns 201 Created');
      assert(regRes.data?.success === true, 'Registration reports success: true');
      assert(Boolean(regRes.data?.data?.accessToken), 'Returns valid JWT accessToken');
      assert(Boolean(regRes.data?.data?.refreshToken), 'Returns valid JWT refreshToken');
      primaryToken = regRes.data?.data?.accessToken;
      refreshTokenVal = regRes.data?.data?.refreshToken;
      testUserId = regRes.data?.data?.user?._id;

      // 2.2 Reject Duplicate Email
      const dupRes = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Alex Duplicate',
          email: testUserEmail,
          password: 'Password123!'
        }
      });
      assert(dupRes.status === 400, 'POST /api/auth/register returns 400 on duplicate email');
      assert(dupRes.data?.success === false, 'Duplicate registration reports success: false');

      // 2.3 Reject Short Password
      const weakRes = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Weak Pass',
          email: `weak_${Date.now()}@test.com`,
          password: '123'
        }
      });
      assert(weakRes.status === 400, 'POST /api/auth/register returns 400 on short password');

      // 2.4 Login with Valid Credentials
      const loginRes = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: testUserEmail,
          password: 'Password123!'
        }
      });
      assert(loginRes.status === 200, 'POST /api/auth/login returns 200 OK');
      assert(loginRes.data?.data?.user?.email === testUserEmail.toLowerCase(), 'Login returns matched user record');
      primaryToken = loginRes.data?.data?.accessToken;

      // 2.5 Login with Invalid Password
      const badLogin = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: testUserEmail,
          password: 'WrongPassword!'
        }
      });
      assert(badLogin.status === 401, 'POST /api/auth/login returns 401 on incorrect password');

      // 2.6 Token Refresh Workflow
      const refreshRes = await apiRequest('/api/auth/refresh', {
        method: 'POST',
        body: { token: refreshTokenVal }
      });
      assert(refreshRes.status === 200, 'POST /api/auth/refresh returns 200 OK');
      assert(Boolean(refreshRes.data?.data?.accessToken), 'Refresh endpoint issues new accessToken');

      // 2.7 Fetch Authenticated User Profile (GET /me)
      const meRes = await apiRequest('/api/auth/me', { token: primaryToken });
      assert(meRes.status === 200, 'GET /api/auth/me returns 200 OK');
      assert(meRes.data?.data?.user?.name === 'Alex Rivera', 'Profile contains accurate user name');
      assert(Boolean(meRes.data?.data?.settings), 'Profile includes auto-created UserSettings');

      // 2.8 Unauthorized Request Guard (No Token)
      const unauthRes = await apiRequest('/api/auth/me');
      assert(unauthRes.status === 401, 'GET /api/auth/me returns 401 Unauthorized without token');

      // 2.9 Update User Profile
      const updateProfRes = await apiRequest('/api/auth/profile', {
        method: 'PUT',
        token: primaryToken,
        body: {
          name: 'Alex Rivera Senior',
          bio: 'Lead Architect & High-Performance Fullstack Engineer'
        }
      });
      assert(updateProfRes.status === 200, 'PUT /api/auth/profile returns 200 OK');
      assert(updateProfRes.data?.data?.user?.name === 'Alex Rivera Senior', 'Profile name updated correctly');
    }

    // ============================================================
    // 3. SETTINGS & PREFERENCES SUITE
    // ============================================================
    console.log('\n▶ SUITE 3: User Settings, Theme & Account Preferences');
    {
      // 3.1 Get Settings
      const getSet = await apiRequest('/api/settings', { token: primaryToken });
      assert(getSet.status === 200, 'GET /api/settings returns 200 OK');
      assert(getSet.data?.success === true, 'Settings payload success: true');

      // 3.2 Update Theme
      const updateTheme = await apiRequest('/api/settings/theme', {
        method: 'PUT',
        token: primaryToken,
        body: { theme: 'dark' }
      });
      assert(updateTheme.status === 200, 'PUT /api/settings/theme returns 200 OK');
      assert(updateTheme.data?.data?.theme === 'dark', 'Theme updated to dark');

      // 3.3 Update Notification Preferences
      const updateNotifPref = await apiRequest('/api/settings/notifications', {
        method: 'PUT',
        token: primaryToken,
        body: {
          email: true,
          push: true,
          sound: false,
          taskReminders: true
        }
      });
      assert(updateNotifPref.status === 200, 'PUT /api/settings/notifications returns 200 OK');

      // 3.4 Update Profile Settings
      const updateProfSet = await apiRequest('/api/settings/profile', {
        method: 'PUT',
        token: primaryToken,
        body: { bio: 'Updated bio via settings' }
      });
      assert(updateProfSet.status === 200, 'PUT /api/settings/profile returns 200 OK');

      // 3.5 Password Change Flow (Success & Failure cases)
      const badPassRes = await apiRequest('/api/settings/password', {
        method: 'PUT',
        token: primaryToken,
        body: { currentPassword: 'IncorrectOldPassword', newPassword: 'NewSecurePassword123!' }
      });
      assert(badPassRes.status === 400, 'PUT /api/settings/password returns 400 on invalid current password');

      const goodPassRes = await apiRequest('/api/settings/password', {
        method: 'PUT',
        token: primaryToken,
        body: { currentPassword: 'Password123!', newPassword: 'NewSecurePassword123!' }
      });
      assert(goodPassRes.status === 200, 'PUT /api/settings/password returns 200 on valid password change');

      // 3.6 Export User Data Bundle
      const exportRes = await apiRequest('/api/settings/export', { token: primaryToken });
      assert(exportRes.status === 200, 'GET /api/settings/export returns 200 OK');
      assert(exportRes.data?.exportVersion === '1.0', 'Export contains valid exportVersion');
      assert(Array.isArray(exportRes.data?.tasks), 'Export includes tasks array');
    }

    // ============================================================
    // 4. TASK MANAGEMENT SUITE
    // ============================================================
    console.log('\n▶ SUITE 4: Task Lifecycle, Filtering & Subtasks');
    {
      // 4.1 Validation Error on Missing Title
      const invalidTask = await apiRequest('/api/tasks', {
        method: 'POST',
        token: primaryToken,
        body: { description: 'Missing title task' }
      });
      assert(invalidTask.status === 400, 'POST /api/tasks returns 400 when title is missing');

      // 4.2 Create Task
      const createTaskRes = await apiRequest('/api/tasks', {
        method: 'POST',
        token: primaryToken,
        body: {
          title: 'Implement GraphQL Layer',
          description: 'Build GraphQL query resolver for dashboard aggregate data.',
          priority: 'high',
          status: 'in_progress',
          dueDate: new Date('2026-09-15T18:00:00.000Z'),
          dueTime: '18:00',
          tags: ['GraphQL', 'Backend', 'Optimization'],
          estimatedMinutes: 180,
          subtasks: [
            { title: 'Define GraphQL Schema', isCompleted: true },
            { title: 'Write Root Query Resolvers', isCompleted: false }
          ]
        }
      });
      assert(createTaskRes.status === 201, 'POST /api/tasks returns 201 Created');
      assert(createTaskRes.data?.data?.title === 'Implement GraphQL Layer', 'Task title matches');
      assert(createTaskRes.data?.data?.subtasks?.length === 2, 'Subtasks persisted correctly');
      sampleTaskId = createTaskRes.data?.data?._id;

      // 4.3 Get All Tasks
      const getTasksRes = await apiRequest('/api/tasks', { token: primaryToken });
      assert(getTasksRes.status === 200, 'GET /api/tasks returns 200 OK');
      assert(getTasksRes.data?.count >= 1, 'Task count is at least 1');

      // 4.4 Filter Tasks by Status
      const filteredTasks = await apiRequest('/api/tasks?status=in_progress', { token: primaryToken });
      assert(filteredTasks.status === 200, 'GET /api/tasks?status=in_progress returns 200 OK');
      assert(filteredTasks.data?.data?.every(t => t.status === 'in_progress'), 'Filtered tasks only return in_progress tasks');

      // 4.5 Search Tasks
      const searchTask = await apiRequest('/api/tasks?search=GraphQL', { token: primaryToken });
      assert(searchTask.status === 200, 'GET /api/tasks?search=GraphQL returns 200 OK');
      assert(searchTask.data?.count >= 1, 'Search query returns matching task');

      // 4.6 Get Single Task by ID
      const singleTask = await apiRequest(`/api/tasks/${sampleTaskId}`, { token: primaryToken });
      assert(singleTask.status === 200, 'GET /api/tasks/:id returns 200 OK');
      assert(singleTask.data?.data?._id === sampleTaskId, 'Returned task ID matches');

      // 4.7 Update Task Details
      const updateTaskRes = await apiRequest(`/api/tasks/${sampleTaskId}`, {
        method: 'PUT',
        token: primaryToken,
        body: {
          title: 'Implement GraphQL & REST Gateway',
          priority: 'urgent'
        }
      });
      assert(updateTaskRes.status === 200, 'PUT /api/tasks/:id returns 200 OK');
      assert(updateTaskRes.data?.data?.priority === 'urgent', 'Task priority updated to urgent');

      // 4.8 Patch Task Status
      const patchStatus = await apiRequest(`/api/tasks/${sampleTaskId}/status`, {
        method: 'PATCH',
        token: primaryToken,
        body: { status: 'completed' }
      });
      assert(patchStatus.status === 200, 'PATCH /api/tasks/:id/status returns 200 OK');
      assert(patchStatus.data?.data?.status === 'completed', 'Task status updated to completed');
      assert(Boolean(patchStatus.data?.data?.completedAt), 'completedAt timestamp populated');

      // 4.9 Delete Task
      const deleteTaskRes = await apiRequest(`/api/tasks/${sampleTaskId}`, {
        method: 'DELETE',
        token: primaryToken
      });
      assert(deleteTaskRes.status === 200, 'DELETE /api/tasks/:id returns 200 OK');

      // 4.10 Confirm 404 on Deleted Task
      const deletedCheck = await apiRequest(`/api/tasks/${sampleTaskId}`, { token: primaryToken });
      assert(deletedCheck.status === 404, 'GET /api/tasks/:id returns 404 after deletion');
    }

    // ============================================================
    // 5. NOTES & MARKDOWN WORKSPACE SUITE
    // ============================================================
    console.log('\n▶ SUITE 5: Notes, Markdown & Pinning');
    {
      // 5.1 Create Note
      const createNoteRes = await apiRequest('/api/notes', {
        method: 'POST',
        token: primaryToken,
        body: {
          title: 'Distributed Caching Strategies',
          content: '# Redis & Memory Caching\n- Use LRU cache policy\n- Set TTL for volatile keys',
          category: 'Architecture',
          tags: ['Cache', 'Redis', 'Backend'],
          isPinned: false,
          color: '#3b82f6'
        }
      });
      assert(createNoteRes.status === 201, 'POST /api/notes returns 201 Created');
      assert(createNoteRes.data?.data?.title === 'Distributed Caching Strategies', 'Note title matches');
      sampleNoteId = createNoteRes.data?.data?._id;

      // 5.2 Get All Notes
      const getNotesRes = await apiRequest('/api/notes', { token: primaryToken });
      assert(getNotesRes.status === 200, 'GET /api/notes returns 200 OK');
      assert(getNotesRes.data?.data?.notes?.length >= 1, 'Notes list contains at least 1 note');

      // 5.3 Get Note by ID
      const getNoteId = await apiRequest(`/api/notes/${sampleNoteId}`, { token: primaryToken });
      assert(getNoteId.status === 200, 'GET /api/notes/:id returns 200 OK');

      // 5.4 Update Note Content
      const updateNoteRes = await apiRequest(`/api/notes/${sampleNoteId}`, {
        method: 'PUT',
        token: primaryToken,
        body: {
          title: 'Distributed Caching Strategies v2',
          category: 'Architecture'
        }
      });
      assert(updateNoteRes.status === 200, 'PUT /api/notes/:id returns 200 OK');
      assert(updateNoteRes.data?.data?.title === 'Distributed Caching Strategies v2', 'Note title updated');

      // 5.5 Toggle Pin Status
      const togglePin = await apiRequest(`/api/notes/${sampleNoteId}/pin`, {
        method: 'PATCH',
        token: primaryToken
      });
      assert(togglePin.status === 200, 'PATCH /api/notes/:id/pin returns 200 OK');
      assert(togglePin.data?.data?.isPinned === true, 'Note pinned state toggled to true');

      // 5.6 Delete Note
      const deleteNoteRes = await apiRequest(`/api/notes/${sampleNoteId}`, {
        method: 'DELETE',
        token: primaryToken
      });
      assert(deleteNoteRes.status === 200, 'DELETE /api/notes/:id returns 200 OK');
    }

    // ============================================================
    // 6. CALENDAR & EVENTS SUITE
    // ============================================================
    console.log('\n▶ SUITE 6: Calendar & Scheduled Events');
    {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 3600000);

      // 6.1 Create Calendar Event
      const createEventRes = await apiRequest('/api/calendar', {
        method: 'POST',
        token: primaryToken,
        body: {
          title: 'Executive Architecture Review',
          description: 'Quarterly architecture review and microservice capacity planning.',
          startTime: now.toISOString(),
          endTime: oneHourLater.toISOString(),
          location: 'Conference Room 4B',
          category: 'Work',
          color: '#6366f1',
          reminderMinutesBefore: 15
        }
      });
      assert(createEventRes.status === 201, 'POST /api/calendar returns 201 Created');
      assert(createEventRes.data?.data?.title === 'Executive Architecture Review', 'Event title matches');
      sampleEventId = createEventRes.data?.data?._id;

      // 6.2 Get Events (using /api/calendar)
      const getCalRes = await apiRequest('/api/calendar', { token: primaryToken });
      assert(getCalRes.status === 200, 'GET /api/calendar returns 200 OK');
      assert(getCalRes.data?.data?.events?.length >= 1, 'Calendar returns events array');

      // 6.3 Get Events Alias Route (/api/events)
      const getEventsAlias = await apiRequest('/api/events', { token: primaryToken });
      assert(getEventsAlias.status === 200, 'GET /api/events returns 200 OK (alias route)');
      assert(getEventsAlias.data?.data?.events?.length >= 1, 'Events alias returns events array');

      // 6.4 Update Event
      const updateEventRes = await apiRequest(`/api/calendar/${sampleEventId}`, {
        method: 'PUT',
        token: primaryToken,
        body: {
          title: 'Executive Architecture Review (Extended)',
          location: 'Boardroom A'
        }
      });
      assert(updateEventRes.status === 200, 'PUT /api/calendar/:id returns 200 OK');
      assert(updateEventRes.data?.data?.location === 'Boardroom A', 'Event location updated');

      // 6.5 Delete Event
      const deleteEventRes = await apiRequest(`/api/calendar/${sampleEventId}`, {
        method: 'DELETE',
        token: primaryToken
      });
      assert(deleteEventRes.status === 200, 'DELETE /api/calendar/:id returns 200 OK');
    }

    // ============================================================
    // 7. REMINDERS & ALERTS SUITE
    // ============================================================
    console.log('\n▶ SUITE 7: Reminders, Snoozing & Lifecycle');
    {
      // 7.1 Create Reminder
      const createReminderRes = await apiRequest('/api/reminders', {
        method: 'POST',
        token: primaryToken,
        body: {
          title: 'Review System Metrics at 4 PM',
          relatedType: 'task',
          reminderDate: new Date().toISOString(),
          reminderTime: '16:00',
          recurrence: 'daily'
        }
      });
      assert(createReminderRes.status === 201, 'POST /api/reminders returns 201 Created');
      sampleReminderId = createReminderRes.data?.data?._id;

      // 7.2 Get Reminders
      const getRemindersRes = await apiRequest('/api/reminders', { token: primaryToken });
      assert(getRemindersRes.status === 200, 'GET /api/reminders returns 200 OK');

      // 7.3 Update Reminder
      const updateRemRes = await apiRequest(`/api/reminders/${sampleReminderId}`, {
        method: 'PUT',
        token: primaryToken,
        body: { title: 'Review System Metrics at 5 PM', reminderTime: '17:00' }
      });
      assert(updateRemRes.status === 200, 'PUT /api/reminders/:id returns 200 OK');

      // 7.4 Snooze Reminder
      const snoozeRes = await apiRequest(`/api/reminders/${sampleReminderId}/snooze`, {
        method: 'PATCH',
        token: primaryToken,
        body: { snoozeMinutes: 15 }
      });
      assert(snoozeRes.status === 200, 'PATCH /api/reminders/:id/snooze returns 200 OK');

      // 7.5 Complete Reminder
      const completeRemRes = await apiRequest(`/api/reminders/${sampleReminderId}/complete`, {
        method: 'PATCH',
        token: primaryToken
      });
      assert(completeRemRes.status === 200, 'PATCH /api/reminders/:id/complete returns 200 OK');
      assert(completeRemRes.data?.data?.isCompleted === true, 'Reminder marked completed: true');

      // 7.6 Dismiss Reminder
      const dismissRemRes = await apiRequest(`/api/reminders/${sampleReminderId}/dismiss`, {
        method: 'PATCH',
        token: primaryToken
      });
      assert(dismissRemRes.status === 200, 'PATCH /api/reminders/:id/dismiss returns 200 OK');

      // 7.7 Delete Reminder
      const deleteRemRes = await apiRequest(`/api/reminders/${sampleReminderId}`, {
        method: 'DELETE',
        token: primaryToken
      });
      assert(deleteRemRes.status === 200, 'DELETE /api/reminders/:id returns 200 OK');
    }

    // ============================================================
    // 8. NOTIFICATIONS SUITE
    // ============================================================
    console.log('\n▶ SUITE 8: Notifications & Read/Unread State');
    {
      // Create test notification in DB
      const testNotif = await Notification.create({
        user: testUserId,
        userId: testUserId,
        title: 'System Test Notification',
        message: 'This is an automated test notification.',
        type: 'system',
        isRead: false
      });
      sampleNotificationId = testNotif._id.toString();

      // 8.1 Get Notifications
      const getNotifs = await apiRequest('/api/notifications', { token: primaryToken });
      assert(getNotifs.status === 200, 'GET /api/notifications returns 200 OK');
      assert(getNotifs.data?.data?.length >= 1, 'Notifications array populated');

      // 8.2 Mark Single Notification Read
      const markRead = await apiRequest(`/api/notifications/${sampleNotificationId}/read`, {
        method: 'PATCH',
        token: primaryToken
      });
      assert(markRead.status === 200, 'PATCH /api/notifications/:id/read returns 200 OK');
      assert(markRead.data?.data?.isRead === true, 'Notification marked isRead: true');

      // 8.3 Mark Notification Unread
      const markUnread = await apiRequest(`/api/notifications/${sampleNotificationId}/unread`, {
        method: 'PATCH',
        token: primaryToken
      });
      assert(markUnread.status === 200, 'PATCH /api/notifications/:id/unread returns 200 OK');
      assert(markUnread.data?.data?.isRead === false, 'Notification marked isRead: false');

      // 8.4 Mark All Read
      const markAll = await apiRequest('/api/notifications/read-all', {
        method: 'PATCH',
        token: primaryToken
      });
      assert(markAll.status === 200, 'PATCH /api/notifications/read-all returns 200 OK');

      // 8.5 Delete Notification
      const delNotif = await apiRequest(`/api/notifications/${sampleNotificationId}`, {
        method: 'DELETE',
        token: primaryToken
      });
      assert(delNotif.status === 200, 'DELETE /api/notifications/:id returns 200 OK');

      // 8.6 Get VAPID Public Key
      const vapidRes = await apiRequest('/api/notifications/vapid-public-key', { token: primaryToken });
      assert(vapidRes.status === 200, 'GET /api/notifications/vapid-public-key returns 200 OK');
      assert(Boolean(vapidRes.data?.data?.publicKey), 'VAPID public key returned');

      // 8.7 Subscribe to Web Push
      const subRes = await apiRequest('/api/notifications/subscribe', {
        method: 'POST',
        token: primaryToken,
        body: {
          endpoint: 'https://updates.push.services.mozilla.com/wpush/v2/gAAAAABtest123',
          keys: {
            p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM',
            auth: 'tBHItJI5svbpez7KI4CCXg'
          }
        }
      });
      assert(subRes.status === 201, 'POST /api/notifications/subscribe returns 201 Created');

      // 8.8 Test Push Dispatch
      const testPushRes = await apiRequest('/api/notifications/test-push', {
        method: 'POST',
        token: primaryToken
      });
      assert(testPushRes.status === 200, 'POST /api/notifications/test-push returns 200 OK');

      // 8.9 Unsubscribe from Web Push
      const unsubRes = await apiRequest('/api/notifications/unsubscribe', {
        method: 'POST',
        token: primaryToken,
        body: { endpoint: 'https://updates.push.services.mozilla.com/wpush/v2/gAAAAABtest123' }
      });
      assert(unsubRes.status === 200, 'POST /api/notifications/unsubscribe returns 200 OK');
    }

    // ============================================================
    // 9. DOCUMENT LOCKER VAULT SUITE
    // ============================================================
    console.log('\n▶ SUITE 9: Document Vault, Multipart Upload & File Operations');
    {
      // 9.1 Upload Document via Multipart FormData
      const formData = new FormData();
      const blob = new Blob(['OneSpace Automated Test Document Content'], { type: 'text/plain' });
      formData.append('file', blob, 'automated_test_doc.txt');
      formData.append('category', 'Architecture');
      formData.append('tags', 'Test,Integration,Specs');
      formData.append('notes', 'Uploaded via automated HTTP test suite.');

      const uploadRes = await apiRequest('/api/documents', {
        method: 'POST',
        token: primaryToken,
        body: formData,
        isFormData: true
      });
      assert(uploadRes.status === 201, 'POST /api/documents returns 201 Created');
      assert(uploadRes.data?.data?.originalName === 'automated_test_doc.txt', 'Document originalName matches');
      assert(uploadRes.data?.data?.category === 'Architecture', 'Document category matches');
      sampleDocumentId = uploadRes.data?.data?._id;

      // 9.2 Get Documents List & Categories
      const getDocs = await apiRequest('/api/documents', { token: primaryToken });
      assert(getDocs.status === 200, 'GET /api/documents returns 200 OK');
      assert(getDocs.data?.data?.documents?.length >= 1, 'Documents list contains uploaded document');
      assert(Array.isArray(getDocs.data?.data?.categories), 'Categories array returned');

      // 9.3 Get Document by ID
      const getDocId = await apiRequest(`/api/documents/${sampleDocumentId}`, { token: primaryToken });
      assert(getDocId.status === 200, 'GET /api/documents/:id returns 200 OK');

      // 9.4 Rename Document
      const renameDoc = await apiRequest(`/api/documents/${sampleDocumentId}/rename`, {
        method: 'PUT',
        token: primaryToken,
        body: { originalName: 'renamed_test_doc.txt' }
      });
      assert(renameDoc.status === 200, 'PUT /api/documents/:id/rename returns 200 OK');
      assert(renameDoc.data?.data?.originalName === 'renamed_test_doc.txt', 'Document name updated');

      // 9.5 Update Document Metadata
      const updateDocMeta = await apiRequest(`/api/documents/${sampleDocumentId}`, {
        method: 'PUT',
        token: primaryToken,
        body: {
          category: 'Engineering',
          notes: 'Updated engineering notes for test document.'
        }
      });
      assert(updateDocMeta.status === 200, 'PUT /api/documents/:id returns 200 OK');
      assert(updateDocMeta.data?.data?.category === 'Engineering', 'Category updated');

      // 9.6 View Document Content (Stream)
      const viewDoc = await apiRequest(`/api/documents/${sampleDocumentId}/view`, { token: primaryToken });
      assert(viewDoc.status === 200, 'GET /api/documents/:id/view returns 200 OK file stream');

      // 9.7 Download Document
      const downloadDoc = await apiRequest(`/api/documents/${sampleDocumentId}/download`, { token: primaryToken });
      assert(downloadDoc.status === 200, 'GET /api/documents/:id/download returns 200 OK');

      // 9.8 Delete Document
      const deleteDoc = await apiRequest(`/api/documents/${sampleDocumentId}`, {
        method: 'DELETE',
        token: primaryToken
      });
      assert(deleteDoc.status === 200, 'DELETE /api/documents/:id returns 200 OK');
    }

    // ============================================================
    // 10. DAILY ACTIVITIES & HABIT MATRIX SUITE
    // ============================================================
    console.log('\n▶ SUITE 10: Daily Activities, Habit Heatmap & Expenses');
    {
      // 10.1 Create Daily Activity
      const createAct = await apiRequest('/api/daily-activity', {
        method: 'POST',
        token: primaryToken,
        body: {
          date: todayStr,
          mood: 5,
          energyLevel: 5,
          sleepHours: 8,
          waterIntakeMl: 2600,
          journalEntry: 'Highly productive test day with great focus.',
          habits: [
            { name: 'Morning 5km Run', isCompleted: true, status: 'done' },
            { name: 'Drink 2.5L Water', isCompleted: true, status: 'done' },
            { name: 'Read 30 mins', isCompleted: false, status: 'not done' }
          ],
          expenses: [
            { description: 'Healthy Grocery Haul', amount: 65.50, category: 'Food' },
            { description: 'Commute Metro Pass', amount: 15.00, category: 'Transport' }
          ]
        }
      });
      assert(createAct.status === 201, 'POST /api/daily-activity returns 201 Created');
      sampleActivityId = createAct.data?.data?._id;

      // 10.2 Get Activities List
      const getActs = await apiRequest('/api/daily-activity', { token: primaryToken });
      assert(getActs.status === 200, 'GET /api/daily-activity returns 200 OK');

      // 10.3 Get Activity by Date
      const getByDate = await apiRequest(`/api/daily-activity/${todayStr}`, { token: primaryToken });
      assert(getByDate.status === 200, 'GET /api/daily-activity/:date returns 200 OK');
      assert(getByDate.data?.data?.sleepHours === 8, 'Sleep hours match created activity');

      // 10.4 Upsert Activity for Date
      const upsertAct = await apiRequest(`/api/daily-activity/${todayStr}`, {
        method: 'PUT',
        token: primaryToken,
        body: {
          sleepHours: 8.5,
          waterIntakeMl: 3000
        }
      });
      assert(upsertAct.status === 200, 'PUT /api/daily-activity/:date returns 200 OK');
      assert(upsertAct.data?.data?.waterIntakeMl === 3000, 'Water intake updated via upsert');

      // 10.5 Activity History
      const getHist = await apiRequest('/api/daily-activity/history?days=30', { token: primaryToken });
      assert(getHist.status === 200, 'GET /api/daily-activity/history returns 200 OK');

      // 10.6 Activity Heatmap
      const getHeatmap = await apiRequest('/api/daily-activity/heatmap', { token: primaryToken });
      assert(getHeatmap.status === 200, 'GET /api/daily-activity/heatmap returns 200 OK');

      // 10.7 Toggle Habit Status
      const toggleHabit = await apiRequest(`/api/daily-activity/${sampleActivityId}/toggle`, {
        method: 'PATCH',
        token: primaryToken,
        body: { habitName: 'Read 30 mins' }
      });
      assert(toggleHabit.status === 200, 'PATCH /api/daily-activity/:id/toggle returns 200 OK');

      // 10.8 Update Activity Item
      const updateItem = await apiRequest(`/api/daily-activity/item/${sampleActivityId}`, {
        method: 'PUT',
        token: primaryToken,
        body: { mood: 4 }
      });
      assert(updateItem.status === 200, 'PUT /api/daily-activity/item/:id returns 200 OK');

      // 10.9 Delete Activity Item
      const delItem = await apiRequest(`/api/daily-activity/item/${sampleActivityId}`, {
        method: 'DELETE',
        token: primaryToken
      });
      assert(delItem.status === 200, 'DELETE /api/daily-activity/item/:id returns 200 OK');
    }

    // ============================================================
    // 11. FITNESS & WORKOUT TRACKING SUITE
    // ============================================================
    console.log('\n▶ SUITE 11: Fitness Workouts, Exercises & Weight Progression');
    {
      // 11.1 Create Fitness Record
      const createFit = await apiRequest('/api/fitness', {
        method: 'POST',
        token: primaryToken,
        body: {
          date: todayStr,
          type: 'workout',
          workoutType: 'Strength',
          durationMinutes: 60,
          caloriesBurned: 480,
          steps: 9200,
          bodyWeightKg: 76.5,
          exercises: [
            { name: 'Barbell Squat', sets: 4, reps: 8, weightKg: 100 },
            { name: 'Bench Press', sets: 4, reps: 10, weightKg: 80 }
          ],
          notes: 'Strong strength workout with progressive overload.'
        }
      });
      assert(createFit.status === 201, 'POST /api/fitness returns 201 Created');
      assert(createFit.data?.data?.caloriesBurned === 480, 'Calories burned match');
      sampleFitnessId = createFit.data?.data?._id;

      // 11.2 Get Fitness Records
      const getFit = await apiRequest('/api/fitness', { token: primaryToken });
      assert(getFit.status === 200, 'GET /api/fitness returns 200 OK');
      assert(getFit.data?.data?.length >= 1, 'Fitness records returned');

      // 11.3 Get Weight History
      const getWeightHist = await apiRequest('/api/fitness/weight-history', { token: primaryToken });
      assert(getWeightHist.status === 200, 'GET /api/fitness/weight-history returns 200 OK');

      // 11.4 Update Fitness Record
      const updateFit = await apiRequest(`/api/fitness/${sampleFitnessId}`, {
        method: 'PUT',
        token: primaryToken,
        body: {
          caloriesBurned: 520,
          steps: 10000
        }
      });
      assert(updateFit.status === 200, 'PUT /api/fitness/:id returns 200 OK');
      assert(updateFit.data?.data?.caloriesBurned === 520, 'Calories burned updated');

      // 11.5 Delete Fitness Record
      const delFit = await apiRequest(`/api/fitness/${sampleFitnessId}`, {
        method: 'DELETE',
        token: primaryToken
      });
      assert(delFit.status === 200, 'DELETE /api/fitness/:id returns 200 OK');
    }

    // ============================================================
    // 12. GOALS & PROGRESS TIMELINE SUITE
    // ============================================================
    console.log('\n▶ SUITE 12: Goals, Target Metrics & Milestone Logging');
    {
      // 12.1 Create Goal
      const createGoalRes = await apiRequest('/api/goals', {
        method: 'POST',
        token: primaryToken,
        body: {
          title: 'Complete Full Marathon (42.2km)',
          description: 'Endurance training program for official autumn marathon.',
          category: 'Health',
          targetDate: new Date('2026-11-15T00:00:00.000Z'),
          metrics: { startValue: 0, targetValue: 42, currentValue: 10, unit: 'km' },
          color: '#10b981',
          milestones: [
            { title: '10km Training Milestone', isCompleted: true },
            { title: '21.1km Half Marathon', isCompleted: false },
            { title: '32km Long Run Test', isCompleted: false },
            { title: '42.2km Race Day', isCompleted: false }
          ]
        }
      });
      assert(createGoalRes.status === 201, 'POST /api/goals returns 201 Created');
      assert(createGoalRes.data?.data?.title === 'Complete Full Marathon (42.2km)', 'Goal title matches');
      sampleGoalId = createGoalRes.data?.data?._id;

      // 12.2 Get Goals
      const getGoals = await apiRequest('/api/goals', { token: primaryToken });
      assert(getGoals.status === 200, 'GET /api/goals returns 200 OK');
      assert(getGoals.data?.data?.length >= 1, 'Goals list returned');

      // 12.3 Get Single Goal with Progress Timeline
      const getGoalId = await apiRequest(`/api/goals/${sampleGoalId}`, { token: primaryToken });
      assert(getGoalId.status === 200, 'GET /api/goals/:id returns 200 OK');
      assert(getGoalId.data?.data?.goal?._id === sampleGoalId, 'Returned goal ID matches');

      // 12.4 Log Goal Progress
      const logProg = await apiRequest(`/api/goals/${sampleGoalId}/progress`, {
        method: 'POST',
        token: primaryToken,
        body: {
          valueAdded: 11.1,
          note: 'Completed half marathon 21.1km training run!'
        }
      });
      assert(logProg.status === 200, 'POST /api/goals/:id/progress returns 200 OK');
      assert(logProg.data?.data?.goal?.metrics?.currentValue === 21.1, 'Goal metrics currentValue incremented to 21.1');

      // 12.5 Update Goal
      const updateGoalRes = await apiRequest(`/api/goals/${sampleGoalId}`, {
        method: 'PUT',
        token: primaryToken,
        body: { description: 'Updated marathon training description.' }
      });
      assert(updateGoalRes.status === 200, 'PUT /api/goals/:id returns 200 OK');

      // 12.6 Mark Goal Complete
      const compGoal = await apiRequest(`/api/goals/${sampleGoalId}/complete`, {
        method: 'PATCH',
        token: primaryToken
      });
      assert(compGoal.status === 200, 'PATCH /api/goals/:id/complete returns 200 OK');
      assert(compGoal.data?.data?.status === 'completed', 'Goal status marked completed');
      assert(compGoal.data?.data?.progressPercent === 100, 'Goal progress percent set to 100');

      // 12.7 Delete Goal
      const delGoal = await apiRequest(`/api/goals/${sampleGoalId}`, {
        method: 'DELETE',
        token: primaryToken
      });
      assert(delGoal.status === 200, 'DELETE /api/goals/:id returns 200 OK');
    }

    // ============================================================
    // 13. GLOBAL CROSS-MODULE SEARCH SUITE
    // ============================================================
    console.log('\n▶ SUITE 13: Omni-Search & Aggregation');
    {
      // 13.1 Global Search with Query
      const searchRes = await apiRequest('/api/search?q=OneSpace', { token: primaryToken });
      assert(searchRes.status === 200, 'GET /api/search?q=OneSpace returns 200 OK');
      assert(searchRes.data?.success === true, 'Search response success: true');
      assert(typeof searchRes.data?.totalResults === 'number', 'totalResults count provided');

      // 13.2 Empty Query Search
      const emptySearch = await apiRequest('/api/search?q=', { token: primaryToken });
      assert(emptySearch.status === 200, 'GET /api/search?q= returns 200 OK');
      assert(emptySearch.data?.data?.tasks?.length === 0, 'Empty query returns empty results');
    }

    // ============================================================
    // 14. DASHBOARD AGGREGATION SUITE
    // ============================================================
    console.log('\n▶ SUITE 14: Dashboard Real-Time Metrics & Overview');
    {
      const dashRes = await apiRequest('/api/dashboard/summary', { token: primaryToken });
      assert(dashRes.status === 200, 'GET /api/dashboard/summary returns 200 OK');
      assert(dashRes.data?.success === true, 'Dashboard summary success: true');
      assert(typeof dashRes.data?.data?.pendingTasksCount === 'number', 'Contains pendingTasksCount');
      assert(typeof dashRes.data?.data?.taskCompletionRate === 'number', 'Contains taskCompletionRate');
      assert(Array.isArray(dashRes.data?.data?.todayHabits), 'Contains todayHabits array');
    }

    // ============================================================
    // 15. ANALYTICS & INSIGHTS SUITE
    // ============================================================
    console.log('\n▶ SUITE 15: Analytics & Composite Productivity Scoring');
    {
      // 15.1 Composite Analytics
      const analRes = await apiRequest('/api/analytics?days=30', { token: primaryToken });
      assert(analRes.status === 200, 'GET /api/analytics returns 200 OK');
      assert(typeof analRes.data?.data?.compositeScore === 'number', 'Analytics contains compositeScore');
      assert(Boolean(analRes.data?.data?.financialAnalytics), 'Contains financialAnalytics metrics');

      // 15.2 Task Analytics
      const taskAnal = await apiRequest('/api/analytics/tasks?days=30', { token: primaryToken });
      assert(taskAnal.status === 200, 'GET /api/analytics/tasks returns 200 OK');

      // 15.3 Daily Activity Analytics
      const actAnal = await apiRequest('/api/analytics/daily-activities?days=30', { token: primaryToken });
      assert(actAnal.status === 200, 'GET /api/analytics/daily-activities returns 200 OK');

      // 15.4 Fitness Analytics
      const fitAnal = await apiRequest('/api/analytics/fitness?days=30', { token: primaryToken });
      assert(fitAnal.status === 200, 'GET /api/analytics/fitness returns 200 OK');

      // 15.5 Goal Analytics
      const goalAnal = await apiRequest('/api/analytics/goals', { token: primaryToken });
      assert(goalAnal.status === 200, 'GET /api/analytics/goals returns 200 OK');
    }

    // ============================================================
    // 16. ERROR HANDLING & 404 SUITE
    // ============================================================
    console.log('\n▶ SUITE 16: Error Handlers & Undefined Routes');
    {
      const notFoundRes = await apiRequest('/api/nonexistent-endpoint-route');
      assert(notFoundRes.status === 404, 'GET /api/nonexistent-endpoint-route returns 404 Not Found');
      assert(notFoundRes.data?.success === false, '404 handler returns success: false');
    }

    // ============================================================
    // CLEANUP & SUMMARY
    // ============================================================
    // Clean test user data
    await User.findByIdAndDelete(testUserId);

    console.log('\n===============================================================');
    console.log(`🎉 ALL ${passedTests} TEST CASES PASSED SUCCESSFULLY! (0 Failures)`);
    console.log('===============================================================\n');

    if (server) {
      server.close();
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test Suite Aborted due to error:', error);
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
    process.exit(1);
  }
}

runEndpointTestSuite();
