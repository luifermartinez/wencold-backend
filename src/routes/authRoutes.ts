import { signInValidator } from "./../validators/authValidators"
import { AuthController } from "../controllers/AuthController"
import { Request, Response, Router } from "express"
import { signUpValidator } from "../validators/authValidators"

const authController = new AuthController()

export const authRoutes = Router()
  .post("/signup", authController.signUp)
  .post("/signin", authController.signIn)
  .post("/signout", authController.signOut)
  .get("/token/:token", authController.getUserInfo)
