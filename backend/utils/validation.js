const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateTimeSlot = (startTime, endTime) => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    return false;
  }
  
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  
  return start < end;
};

const validateBookingDate = (date) => {
  const bookingDate = new Date(date);
  const now = new Date();
  
  // Booking should be in the future
  return bookingDate > now;
};

module.exports = {
  validateEmail,
  validatePhoneNumber,
  validatePassword,
  validateTimeSlot,
  validateBookingDate
};