export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  // 최소 8자, 최소 하나의 문자, 하나의 숫자, 하나의 특수 문자
  const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return re.test(password);
};

export const validateUsername = (username) => {
  // 3-20자, 영문자, 숫자, 언더스코어만 허용
  const re = /^[a-zA-Z0-9_]{3,20}$/;
  return re.test(username);
};

export const validatePhoneNumber = (phoneNumber) => {
  // 한국 전화번호 형식 (010-XXXX-XXXX)
  const re = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
  return re.test(phoneNumber);
};

export const validateName = (name) => {
  return name.length >= 2;
}; 