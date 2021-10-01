import { signInValidator } from './../validators/authValidators';
import { AuthController } from '../controllers/AuthController';
import { Request, Response, Router } from "express";
import { signUpValidator } from '../validators/authValidators';


const authController = new AuthController() as any;

export const authRoutes = Router()
    .post('/signup', signUpValidator.map((val) => val), (req: Request, res: Response, next: Function) => { authController.signUp(req, res); })
    .post('/signin', signInValidator.map(val => val), (req: Request, res: Response, next: Function) => { authController.signIn(req, res); })