const sanitizeString = (val) => {
  if (typeof val !== 'string') return '';
  return val.trim();
};

const validateRegister = (req, res, next) => {
  const { fullName, email, studentId, department, password } = req.body || {};

  if (
    typeof fullName !== 'string' ||
    typeof email !== 'string' ||
    typeof studentId !== 'string' ||
    typeof department !== 'string' ||
    typeof password !== 'string'
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input format. All fields must be strings.',
    });
  }

  const cleanFullName = sanitizeString(fullName);
  const cleanEmail = sanitizeString(email).toLowerCase();
  const cleanStudentId = sanitizeString(studentId);
  const cleanDepartment = sanitizeString(department);

  const errors = [];

  if (!cleanFullName || cleanFullName.length < 2 || cleanFullName.length > 100) {
    errors.push('Full name must be between 2 and 100 characters.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    errors.push('Please provide a valid email address.');
  }

  if (!cleanStudentId || cleanStudentId.length < 3 || cleanStudentId.length > 30) {
    errors.push('Student ID must be between 3 and 30 characters.');
  }

  if (!cleanDepartment) {
    errors.push('Department is required.');
  }

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one letter and one number.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  req.body.fullName = cleanFullName;
  req.body.email = cleanEmail;
  req.body.studentId = cleanStudentId;
  req.body.department = cleanDepartment;
  req.body.password = password;

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Email and password must be strings.',
    });
  }

  const cleanEmail = sanitizeString(email).toLowerCase();

  if (!cleanEmail || !password) {
    return res.status(400).json({
      success: false,
      message: 'Both email and password are required.',
    });
  }

  req.body.email = cleanEmail;
  req.body.password = password;

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
};
