import { Request, Response } from "express"
import { UploadedFile } from "express-fileupload"
import { v4 } from "uuid"
import path from "path"

export const uploadFile = (
  files,
  name,
  validExtensions = ["png", "jpg", "jpeg", "gif"],
  folder: string = ""
) => {
  return new Promise((resolve, reject) => {
    let image = files[name] as UploadedFile

    if (image) {
      const nameArray = image.name.split(".")
      const extension = nameArray[nameArray.length - 1]

      const validExtensions = ["png", "jpg", "jpeg", "gif"]

      if (!validExtensions.includes(extension)) {
        return reject(
          `Extensión de la imágen no permitida. Pemitidas: ${validExtensions}`
        )
      }

      const name = v4() + "." + extension
      let uploadPath = path.join(__dirname, "../../public/", folder, name)

      image.mv(uploadPath, (err) => {
        if (err) {
          return reject(err)
        }
        resolve(`${folder}/${name}`)
      })
    }
  })
}

export const uploadFileWithPath = (
  files,
  validExtensions = ["png", "jpg", "jpeg", "gif"],
  filePath: string = ""
) => {
  return new Promise((resolve, reject) => {
    let image = files.image as UploadedFile

    if (image) {
      const nameArray = image.name.split(".")
      const extension = nameArray[nameArray.length - 1]

      const validExtensions = ["png", "jpg", "jpeg", "gif"]

      if (!validExtensions.includes(extension)) {
        return reject(
          `Extensión de la imágen no permitida. Pemitidas: ${validExtensions}`
        )
      }

      let uploadPath = path.join(__dirname, "../uploads/", filePath)

      image.mv(uploadPath, (err) => {
        if (err) {
          return reject(err)
        }
        resolve(filePath)
      })
    }
  })
}
