import { EntryInvoiceController } from "./../controllers/EntryInvoiceController"
import { isAdminOrManager, isManager } from "./../middlewares/roleMiddlewares"
import { Router } from "express"

const entryInvoiceController = new EntryInvoiceController()

export const entryInvoiceRoutes = Router()
  .post("", isManager, entryInvoiceController.create)
  .get("", isAdminOrManager, entryInvoiceController.listEntries)
  .put('/:id', isManager, entryInvoiceController.returnEntryProduct)
