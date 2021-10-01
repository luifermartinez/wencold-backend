import { body } from "express-validator";

export const signUpValidator = [
    body('email').isEmail().withMessage('Correo inválido'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 carácteres.'),
    body('dni').isLength({ min: 7 }).withMessage('La cédula de identidad o DNI debe tener al menos 7 carácteres')
];

export const signInValidator = [
    body('email').isEmail().withMessage('Correo inválido'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 carácteres.')
];