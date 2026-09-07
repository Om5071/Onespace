const isEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

const isStrongPassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

module.exports = { isEmail, isStrongPassword };
