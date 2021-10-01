import { LoginHistory } from './../entity/LoginHistory';
import { User } from './../entity/User';
import { People } from './../entity/People';
import { Request, Response } from "express";
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import unirest from 'unirest';

export class AuthController {

    async signUp(req: Request, res: Response) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { firstname, lastname, email, password, dni, address, phone } = req.body;

        if (!firstname || !lastname || !email || !password || !dni) return res.status(400).send({ code: 400, message: 'Petición incorrecta.' })

        try {

            let PEOPLE = await People.findOne({ where: { dni: dni } });

            if (!PEOPLE) {
                let USER = await User.findOne({ where: { email: email } });
                if (!USER) {
                    let people = new People();
                    people.dni = dni;
                    people.firstname = firstname;
                    people.lastname = lastname;
                    address && (people.address = address);
                    phone && (people.address = phone);

                    let peopleSaved = await people.save();
                    if (!peopleSaved) return res.status(500).send({ code: 500, error: null, message: 'Ha ocurrido un error.' })

                    let user = new User();
                    user.email = email;
                    user.password = await bcrypt.hash(password, await bcrypt.genSalt(10));

                    let userSaved = await user.save();

                    return res.status(200).send({ code: 200, data: userSaved, message: 'Usuario registrado.' })
                } else {
                    return res.status(409).send({ code: 409, message: 'Este correo ya está en uso.' })
                }
            } else {
                return res.status(409).send({ code: 409, message: 'Este DNI ya está en uso.' })
            }

        } catch (error) {
            return res.status(500).send({ code: 500, error: error, message: 'Error de servidor.' })
        }

    }

    async signIn(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;



        try {

            const ip = req.headers['x-forwarded-for'] ||
                req.socket.remoteAddress ||
                null;

            let user = await User.createQueryBuilder('user').addSelect('user.password').where('user.email = :email', { email: email }).getOne();
            if (!user) return res.status(404).send({ code: 404, message: 'Correo electrónico o contraseña incorrecta' });

            console.log(user);

            console.log(password, user.password);

            bcrypt.compare(password, user.password)
                .then(async (result) => {
                    if (result) {
                        let login = new LoginHistory();
                        login.user = user;
                        login.token = jwt.sign({ user: email, date: new Date() }, process.env.JWTPASSWORD);
                        login.ip = ip.toString();
                        login.device = `NAVEGADOR`;

                        let loginSaved = await login.save();

                        return res.status(200).send({ code: 200, data: loginSaved, message: 'Sesión iniciada correctamente.' })
                    } else {
                        return res.status(404).send({ code: 404, message: 'Correo electrónico o contraseña incorrecta' });
                    }
                })
                .catch(error => console.log(error))


        } catch (error) {
            return res.status(500).send({ code: 500, error: error, message: 'Error de servidor.' })
        }
    }
}