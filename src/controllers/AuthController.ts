import { LoginHistory } from "./../entity/LoginHistory"
import { User } from "./../entity/User"
import { People } from "./../entity/People"
import { Request, Response } from "express"
import bcrypt from "bcrypt"
import { validationResult } from "express-validator"
import jwt from "jsonwebtoken"
import { StatusCodes } from "http-status-codes"

export class AuthController {
  async signUp(req: Request, res: Response) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() })
    }
    const { firstname, lastname, email, password, dni, address, phone } =
      req.body

    if (!firstname || !lastname || !email || !password || !dni)
      return res.status(StatusCodes.BAD_REQUEST).send({
        code: StatusCodes.BAD_REQUEST,
        message: "Petición incorrecta.",
      })

    try {
      let PEOPLE = await People.findOne({ where: { dni: dni } })

      if (!PEOPLE) {
        let USER = await User.findOne({ where: { email: email } })
        if (!USER) {
          let people = new People()
          people.dni = dni
          people.firstname = firstname
          people.lastname = lastname
          address && (people.address = address)
          phone && (people.address = phone)

          let peopleSaved = await people.save()
          if (!peopleSaved)
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
              code: StatusCodes.INTERNAL_SERVER_ERROR,
              error: null,
              message: "Ha ocurrido un error.",
            })

          let user = new User()
          user.email = email
          user.password = await bcrypt.hash(password, await bcrypt.genSalt(10))

          let userSaved = await user.save()

          return res.status(StatusCodes.OK).send({
            code: StatusCodes.OK,
            data: userSaved,
            message: "Usuario registrado.",
          })
        } else {
          return res.status(StatusCodes.CONFLICT).send({
            code: StatusCodes.CONFLICT,
            message: "Este correo ya está en uso.",
          })
        }
      } else {
        return res.status(StatusCodes.CONFLICT).send({
          code: StatusCodes.CONFLICT,
          message: "Este DNI ya está en uso.",
        })
      }
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error,
        message: "Error de servidor.",
      })
    }
  }

  async signIn(req: Request, res: Response) {
    const { email, password } = req.body

    try {
      const ip =
        req.headers["x-forwarded-for"] || req.socket.remoteAddress || null

      let user = await User.findOne({
        where: { email: email },
        select: ["id", "email", "password", "people"],
      })
      console.log(email, password)
      if (!user)
        return res.status(StatusCodes.NOT_FOUND).send({
          code: StatusCodes.NOT_FOUND,
          message: "Correo electrónico o contraseña incorrecta.",
        })

      bcrypt
        .compare(password, user.password)
        .then(async (result) => {
          if (result) {
            let login = new LoginHistory()
            login.user = user
            login.token = jwt.sign(
              { user: email, date: new Date() },
              process.env.JWTPASSWORD
            )
            login.ip = ip.toString()
            login.device = `NAVEGADOR`

            let loginSaved = await login.save()

            return res.status(StatusCodes.OK).send({
              code: StatusCodes.OK,
              data: login.token,
              message: "Sesión iniciada correctamente.",
            })
          } else {
            return res.status(StatusCodes.NOT_FOUND).send({
              code: StatusCodes.NOT_FOUND,
              message: "La contraseña que usted ha ingresado es incorrecta.",
            })
          }
        })
        .catch((error) => console.log(error))
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error,
        message: "Error de servidor.",
      })
    }
  }

  async signOut(req: Request, res: Response) {
    try {
      const token = req.headers.authorization.split(" ")[1]

      let login = await LoginHistory.findOne({ where: { token: token } })
      if (!login)
        return res.status(StatusCodes.NOT_FOUND).send({
          code: StatusCodes.NOT_FOUND,
          message: "No se ha encontrado la sesión.",
        })

      let loginSaved = await login.remove()

      return res.status(StatusCodes.OK).send({
        code: StatusCodes.OK,
        data: loginSaved,
        message: "Sesión cerrada correctamente.",
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error,
        message: "Error de servidor.",
      })
    }
  }

  async getUserInfo(req: Request, res: Response) {
    const { token } = req.params

    if (!token)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: "Token de sesión requerido." })

    let login = await LoginHistory.findOne({ where: { token: token } })
    if (!login)
      return res
        .status(StatusCodes.NOT_FOUND)
        .send({ message: "Sesión expirada." })

    return res.status(StatusCodes.OK).send({
      data: login.user,
      code: StatusCodes.OK,
      message: "Datos del usuario encontrados.",
    })
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body

      let user = await User.findOne({ where: { email: email } })
      if (!user)
        return res.status(StatusCodes.NOT_FOUND).send({
          code: StatusCodes.NOT_FOUND,
          message: "Correo electrónico no encontrado.",
        })

      /* TO DO SEND EMAIL TO RECOVER PASSWORD */

      return res.status(StatusCodes.OK).send({
        code: StatusCodes.OK,
        data: null,
        message: "Correo enviado correctamente.",
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error,
        message: "Error de servidor.",
      })
    }
  }
}
