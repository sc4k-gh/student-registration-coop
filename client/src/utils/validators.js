
export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  export function isValidPhone(phone) {
    return /^\d{10}$/.test(phone);
  }
  
  export function isStrongEnough(password) {
    return password.length >= 6;
  }
  