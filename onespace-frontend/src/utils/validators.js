export const validateEmail = (email) => {
  const re = /^\S+@\S+\.\S+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};
