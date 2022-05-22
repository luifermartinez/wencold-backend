import { isLogged, isManager, isAdmin } from "./../middlewares/roleMiddlewares"
import { ProviderController } from "./../controllers/ProviderController"
import { Router } from "express"

const providerController = new ProviderController()

export const providerRoutes = Router()
  .post("", isAdmin, providerController.createProvider)
  .get("", isLogged, providerController.listProviders)
  .get("/:id", isLogged, providerController.showProvider)
