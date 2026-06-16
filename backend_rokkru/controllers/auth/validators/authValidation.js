export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+='"|{}[\]\\/:;<>?,.\~`]).{8,}$/;
    return passwordRegex.test(password);
};

// export const validateUsername = (username) => {
//     if (!username) return false;
//     return username.trim().length >= 3 && username.trim().length <= 50;
// };

// export const validateOTP = (otp) => {
//     const otpRegex = /^\d{6}$/;
//     return otpRegex.test(otp.toString());
// };

// export const validateUserType = (userType) => {
//     const validTypes = ['student', 'mentor', 'admin'];
//     return validTypes.includes(userType.toLowerCase());
// };

// export const validatePhoneNumber = (phone) => {
//     const phoneRegex = /^[0-9]{8,15}$/;
//     return phoneRegex.test(phone.toString().replace(/[- ]/g, ''));
// };
