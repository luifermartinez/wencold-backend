import { MovementsControler } from "./../controllers/MovementsController"
import { isAdminOrManager } from "./../middlewares/roleMiddlewares"
import { Router } from "express"

const movementsController = new MovementsControler()

export const movementsRoutes = Router().get(
  "",
  isAdminOrManager,
  movementsController.getMovements
)
