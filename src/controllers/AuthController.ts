import { LoginHistory } from "./../entity/LoginHistory"
import { User } from "./../entity/User"
import { People } from "./../entity/People"
import { Request, Response } from "express"
import bcrypt from "bcrypt"
import { validationResult } from "express-validator"
import jwt from "jsonwebtoken"
import { StatusCodes } from "http-status-codes"
import { userStatuses } from "../helpers/userStatuses"

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
          user.people = peopleSaved

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
        select: ["id", "email", "password", "people", "status", "bannedReason"],
      })
      if (!user)
        return res.status(StatusCodes.NOT_FOUND).send({
          code: StatusCodes.NOT_FOUND,
          message: "Correo electrónico o contraseña incorrecta.",
        })

      bcrypt
        .compare(password, user.password)
        .then(async (result) => {
          if (result) {
            if (user.status === userStatuses.BANNED) {
              return res.status(StatusCodes.FORBIDDEN).send({
                code: StatusCodes.FORBIDDEN,
                message: `Usuario baneado. ${
                  user.bannedReason ? `Motivo: ${user.bannedReason}` : ""
                }`,
              })
            }

            let login = new LoginHistory()
            login.user = user
            login.token = jwt.sign(
              { user: email, date: new Date() },
              process.env.JWTPASSWORD
            )
            login.ip = ip.toString()
            login.device = `NAVEGADOR`

            await login.save()

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
    if (!login) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send({ message: "Sesión expirada." })
    }

    if (login.user.status === userStatuses.BANNED) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .send({ message: "Usuario baneado." })
    }

    return res.status(StatusCodes.OK).send({
      data: login.user,
      code: StatusCodes.OK,
      message: "Datos del usuario encontrados.",
    })
  }

  async checkValid(req: Request, res: Response) {
    try {
      const { email, dni } = req.query

      let user = await User.findOne({ where: { email: email } })
      if (!user)
        return res.status(StatusCodes.NOT_FOUND).send({
          code: StatusCodes.NOT_FOUND,
          message: "Correo electrónico no encontrado.",
        })

      if (user.people.dni !== dni) {
        return res.status(StatusCodes.NOT_FOUND).send({
          code: StatusCodes.NOT_FOUND,
          message: "Identidad no encontrada.",
        })
      }

      return res.status(StatusCodes.OK).send({
        code: StatusCodes.OK,
        data: user,
        message: "Identidad confirmada.",
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error,
        message: "Error de servidor.",
      })
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const { email, password, dni } = req.body

      let user = await User.findOne({ where: { email: email } })
      if (!user)
        return res.status(StatusCodes.NOT_FOUND).send({
          code: StatusCodes.NOT_FOUND,
          message: "Correo electrónico no encontrado.",
        })

      if (user.people.dni !== dni) {
        return res.status(StatusCodes.NOT_FOUND).send({
          code: StatusCodes.NOT_FOUND,
          message: "Identidad no encontrada.",
        })
      }

      user.password = await bcrypt.hash(password, await bcrypt.genSalt(10))

      if (!(await user.save())) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          code: StatusCodes.INTERNAL_SERVER_ERROR,
          message: "Error de servidor.",
        })
      }

      return res.status(StatusCodes.OK).send({
        code: StatusCodes.OK,
        data: user,
        message: "Contraseña cambiada correctamente.",
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
