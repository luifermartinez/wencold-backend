import { ProfileController } from "./../controllers/ProfileController"
import { isLogged } from "./../middlewares/roleMiddlewares"
import { Router } from "express"

const profileController = new ProfileController()

export const profileRoutes = Router()
  .get("", isLogged, profileController.getProfile)
  .put("", isLogged, profileController.updateProfile)
  .put("/password", isLogged, profileController.updatePassword)
  .put("/image", isLogged, profileController.updateProfilePicture)
