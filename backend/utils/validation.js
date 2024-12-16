import z from Zod;

// Schema for non-null values
const notNull = z.string().nonempty("Please input the required field");

// Schema for email validation
const emailValidation = z
    .string()
    .email("Email validation fail!!");

// Schema for password validation
const passwordValidation = z
    .string()
    .min(8, "Password must be at least 8 characters long");

// Schema for currency validation
const currencyValidation = z.enum(["INR", "USD", "EUR", "YEN", "YUAN"]);


// const userSchema = z.object({
//   email: emailValidation,
//   password: passwordValidation,
//   currency: currencyValidation.optional(),
// });

module.exports = {
    notNull,
    emailValidation,
    passwordValidation,
    currencyValidation,
    userSchema,
};
