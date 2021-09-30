import { AuthController } from '../controllers/AuthController';
import { Request, Response, Router } from "express";
import { body, check } from 'express-validator';
import { signUpValidator } from '../validators/authValidators';


const authController = new AuthController() as any;

export const authRoutes = Router()
    .post('/signup', signUpValidator.map((val) => val), (req: Request, res: Response, next: Function) => { authController.signUp(req, res); })