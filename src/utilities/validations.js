import * as yup from 'yup';

export const validateEmail = (t) => {
    return yup.string().email(t('validations.invalidEmail')).required(t('validations.requiredEmail')).matches(REGEX_PATTERNS.email, t('validations.invalidEmail'));
};

export const validateName = (t) => {
    return yup.string().required(t('validations.requiredName')).matches(REGEX_PATTERNS.userName, t('validations.invalidUsername')).min(2, t('validations.invalidNameMin')).max(50, t('validations.invalidNameMax'));
};

export const validateMobile = (t) => {
    return yup.string().required(t('validations.requiredMobile')).matches(REGEX_PATTERNS.mobile, t('validations.invalidMobile')).min(10, t('validations.invalidMobile')).max(17, t('validations.invalidMobile'));
};

export const validateFirstName = (t) => {
    return yup.string().required(t('validations.requiredFirstName')).matches(REGEX_PATTERNS.name, t('validations.invalidName')).min(2, t('validations.invalidNameMin')).max(50, t('validations.invalidNameMax'));
};

export const validateLastName = (t) => {
    return yup.string().required(t('validations.requiredLastName')).matches(REGEX_PATTERNS.name, t('validations.invalidName')).min(2, t('validations.invalidNameMin')).max(50, t('validations.invalidNameMax'));
};

export const validateGender = (t) => {
    return yup.boolean().required(t('validations.requiredGender'));
};

export const validatePassword = (t) => {
    return yup.string().required(t('validations.requiredPassword')).matches(REGEX_PATTERNS.password, t('validations.invalidPassword')).min(8, t('validations.invalidPassword')).max(60, t('validations.invalidPassword'));
};

export const validateConfirmPassword = (t) => {
    return validatePassword(t).oneOf([yup.ref('password'), null], t('validations.invalidConfirmPassword'));
};

export const validateColor = (t) => {
    return yup.mixed().required(t('validations.requiredColor'));
};

export const validateDate = (t) => {
    return yup.date()
      .required(t('validations.requiredDate'))
      .max(new Date(), t('validations.invalidDateFuture')); // Ensures the date is not in the future
};

export const validateUser = (t) => {
    return yup.object().required(t('validations.requiredUser'));
};

export const REGEX_PATTERNS = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    mobile: /^(\+|00)(?:(?!\+0)[0-9]){8,16}$|^(\+|00)(?:(?!\+0)[0-9]){9,17}$/,
    name: /^[a-zA-Z\u0621-\u064A\u0660-\u0669'-]+$/,
    userName: /^[a-zA-Z][a-zA-Z0-9_.]{2,15}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[&$#@!-])(?=.*[0-9]).{8,60}$/,
};
