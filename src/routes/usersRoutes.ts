import { UsersController } from "./../controllers/UsersController"
import { Router } from "express"
import { isAdmin } from "../middlewares/roleMiddlewares"

const usersControler = new UsersController()

export const usersRoutes = Router()
  .get("", isAdmin, usersControler.listUsers)
  .get("/users-registered", isAdmin, usersControler.usersRegistered)
  .get("/:id", usersControler.getUser)
  .put("/:id", isAdmin, usersControler.updateUserStatus)
  .post("/create", usersControler.createUser)
