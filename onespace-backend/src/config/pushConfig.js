const webpush = require('web-push');

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BOaU1txQwForxi4GxkrzIHKPJ5t-pBw_AZfRpn1MnqP3vrZE2D16aaSXtemD_q4nIIUheSuLDeLAzOuo8MKvZfE';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'EEj4vrX9kEHBSzPm7XQqLggrJAgaogj8syqZ7qzVt6w';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:support@onespace.app';

try {
  webpush.setVapidDetails(
    VAPID_EMAIL,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
} catch (err) {
  console.warn('[WebPush] VAPID initialization warning:', err.message);
}

module.exports = {
  webpush,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
};
