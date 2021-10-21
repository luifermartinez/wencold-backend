import { isLogged, isManager } from './../middlewares/roleMiddlewares';
import { ProviderController } from './../controllers/ProviderController';
import { Router } from "express";
import { ProductTypeController } from '../controllers/ProductTypeController';
import { body } from 'express-validator';

const pc = new ProviderController();

export const providerRoutes = Router()
    .post('', isManager, pc.createProvider)
    .get('', isLogged, pc.listProviders)
    .get('/:id', isLogged, pc.showProvider)