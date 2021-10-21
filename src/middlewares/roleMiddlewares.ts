import { LoginHistory } from './../entity/LoginHistory';
import { NextFunction, Request, Response } from "express"
import { getToken } from "../helpers/getToken"
import { userRoles } from '../helpers/userRoles';

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    let token = getToken(req);
    if (!token) return res.status(400).send({ message: 'Token de sesión requerido' });

    const login = await LoginHistory.findOne({ where: { token: token } });
    if (!login) return res.status(404).send({ message: 'Sesión expirada.' });

    if (login.user.role !== userRoles.ADMIN) return res.status(403).send({ message: 'No estás autorizado.' });
    next();
}

export const isManager = async (req: Request, res: Response, next: NextFunction) => {
    let token = getToken(req);
    if (!token) return res.status(400).send({ message: 'Token de sesión requerido' });

    const login = await LoginHistory.findOne({ where: { token: token } });
    if (!login) return res.status(404).send({ message: 'Sesión expirada.' });

    if (login.user.role !== userRoles.MANAGER) return res.status(403).send({ message: 'No estás autorizado.' });
    next();
}

export const isLogged = async (req: Request, res: Response, next: NextFunction) => {
    let token = getToken(req);
    if (!token) return res.status(400).send({ message: 'Token de sesión requerido' });

    const login = await LoginHistory.findOne({ where: { token: token } });
    if (!login) return res.status(404).send({ message: 'Sesión expirada.' });
    next();
}