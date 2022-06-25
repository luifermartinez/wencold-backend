import { AuthController } from "../controllers/AuthController"
import { Router } from "express"

const authController = new AuthController()

export const authRoutes = Router()
  .post("/signup", authController.signUp)
  .post("/signin", authController.signIn)
  .post("/signout", authController.signOut)
  .post("/change-password", authController.changePassword)
  .get("/token/:token", authController.getUserInfo)
  .get("/check", authController.checkValid)
