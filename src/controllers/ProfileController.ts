import fs from "fs"
import path from "path"
import bcrypt from "bcrypt"
import { uploadFile } from "./../utils/uploadFile"
import { LoginHistory } from "./../entity/LoginHistory"
import { StatusCodes } from "http-status-codes"
import { Request, Response } from "express"
import { getToken } from "../helpers/getToken"
import { Image } from "../entity/Image"
import { User } from "../entity/User"

export class ProfileController {
  async getProfile(req: Request, res: Response) {
    try {
      const token = getToken(req)

      const user = (
        await LoginHistory.findOne({
          where: { token },
        })
      ).user

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "Usuario no encontrado.",
          data: null,
          code: StatusCodes.NOT_FOUND,
        })
      }

      return res.status(StatusCodes.OK).send({
        message: "Usuario encontrado.",
        data: user,
        code: StatusCodes.OK,
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: error,
        data: null,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const token = getToken(req)

      const user = (
        await LoginHistory.findOne({
          where: { token },
        })
      ).user

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "Usuario no encontrado.",
          data: null,
          code: StatusCodes.NOT_FOUND,
        })
      }

      const { people } = req.body

      if (!people) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "Petición inválida.",
          data: null,
          code: StatusCodes.BAD_REQUEST,
        })
      }

      user.people.firstname = people.firstname
      user.people.lastname = people.lastname
      user.people.address = people.address
      user.people.phone = people.phone

      await user.people.save()

      return res.status(StatusCodes.OK).send({
        message: "Usuario actualizado.",
        data: user,
        code: StatusCodes.OK,
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: error,
        data: null,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async updatePassword(req: Request, res: Response) {
    try {
      const token = getToken(req)

      const userLogin = await LoginHistory.findOne({
        where: { token },
      })

      const user = await User.findOne({
        select: ["password", "id"],
        where: { id: userLogin.user.id },
      })

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "Usuario no encontrado.",
          data: null,
          code: StatusCodes.NOT_FOUND,
        })
      }

      const { password, actual_password, password_confirmation } = req.body

      if (!password || !actual_password || !password_confirmation) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "Petición inválida.",
          data: null,
          code: StatusCodes.BAD_REQUEST,
        })
      }

      if (password !== password_confirmation) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: "Las contraseñas no coinciden.",
          data: null,
          code: StatusCodes.BAD_REQUEST,
        })
      }

      bcrypt.compare(actual_password, user.password).then(async (result) => {
        if (!result) {
          return res.status(StatusCodes.BAD_REQUEST).send({
            message: "La contraseña actual es incorrecta.",
            data: null,
            code: StatusCodes.BAD_REQUEST,
          })
        }

        user.password = await bcrypt.hash(password, await bcrypt.genSalt(10))

        await user.save()

        return res.status(StatusCodes.OK).send({
          message: "Contraseña actualizada satisfactoriamente.",
          code: StatusCodes.OK,
        })
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: error,
        data: null,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  async updateProfilePicture(req: Request, res: Response) {
    try {
      const token = getToken(req)

      const user = (
        await LoginHistory.findOne({
          where: { token },
        })
      ).user

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).send({
          message: "Usuario no encontrado.",
          data: null,
          code: StatusCodes.NOT_FOUND,
        })
      }

      let patho: any
      let imga: Image

      if (!!user.image) {
        imga = user.image
        const imgPath = path.join(__dirname, "../../public", user.image.path)
        if (fs.existsSync(imgPath)) {
          fs.unlinkSync(imgPath)
        }
      } else {
        imga = new Image()
      }

      patho = await uploadFile(req.files, "image", undefined, `user/${user.id}`)
      imga.path = patho
      const imageSaved = await Image.save(imga)
      user.image = imageSaved

      const userSaved = await user.save()

      return res.status(StatusCodes.OK).send({
        message: "Imagen subida.",
        data: userSaved,
        code: StatusCodes.OK,
      })
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: error,
        data: null,
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }
}
