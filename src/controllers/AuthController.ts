import { User } from './../entity/User';
import { People } from './../entity/People';
import { Request, Response } from "express";
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';

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
}