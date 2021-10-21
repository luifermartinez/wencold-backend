import { signInValidator } from './../validators/authValidators';
import { AuthController } from '../controllers/AuthController';
import { Request, Response, Router } from "express";
import { signUpValidator } from '../validators/authValidators';


const authController = new AuthController();

export const authRoutes = Router()
    .post('/signup', signUpValidator.map((val) => val), authController.signUp)
    .post('/signin', signInValidator.map(val => val), authController.signIn)
    .get('/token/:token', authController.getUserInfo)