import jsonwebtoken from "jsonwebtoken"
import config from "../config.js"
import hashPassword from "../db/hashPassword.js"
import UserModel from "../db/models/UserModel.js"
import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import {
  firstNameValidator,
  lastNameValidator,
  emailValidator,
  passwordValidator,
  stringValidator,
  idValidator,
} from "../validators.js"

const prepareUsersRoutes = ({ app, db }) => {
  app.post(
    "/create-user",
    auth,
    validate({
      body: {
        firstName: firstNameValidator.required(),
        lastName: lastNameValidator.required(),
        email: emailValidator.required(),
        password: passwordValidator.required(),
      },
    }),
    async (req, res) => {
      const { email, password, firstName, lastName } = req.locals.body
      const user = await UserModel.query().findOne({ email })

      if (user) {
        res.send({ result: "OK" })

        return
      }

      const [passwordHash, passwordSalt] = await hashPassword(password)

      await db("users").insert({
        firstName,
        lastName,
        email,
        passwordHash,
        passwordSalt,
      })

      res.send({ result: "OK" })
    }
  )
  app.post(
    "/sign-in",
    auth,
    validate({
      body: {
        email: emailValidator.required(),
        password: stringValidator.required(),
      },
    }),
    async (req, res) => {
      const { email, password } = req.locals.body
      const [user] = await db("users").where({ email })

      if (!user) {
        res.status(401).send({ error: "Invalid credentials." })

        return
      }

      const [passwordHash] = await hashPassword(password, user.passwordSalt)

      if (passwordHash !== user.passwordHash) {
        res.status(401).send({ error: "Invalid credentials." })

        return
      }

      const jwt = jsonwebtoken.sign(
        {
          payload: {
            user: {
              id: user.id,
            },
          },
        },
        config.security.jwt.secret,
        config.security.jwt.options
      )

      res.send({ result: jwt })
    }
  )
  app.patch("/users/:userId", auth, async (req, res) => {
    const { firstName, lastName, email, password, roleId } = req.body
    const [passwordHash, passwordSalt] = await hashPassword(password)
    const user = await UserModel.query().findById(req.params.userId)

    if (!user) {
      res.status(404).send({ error: "User not found" })

      return
    }

    const updatedUser = await UserModel.query()
      .update({
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        ...(email ? { email } : {}),
        ...(passwordHash ? { passwordHash } : {}),
        ...(passwordSalt ? { passwordSalt } : {}),
        ...(roleId ? { roleId } : {}),
      })
      .where({
        id: req.params.userId,
      })
      .returning("*")

    res.send({ result: updatedUser })
  })

  app.delete("/users/:userId", auth, async (req, res) => {
    const user = await UserModel.query().findById(req.params.userId)

    if (!user) {
      res.status(404).send({ error: "User not found" })

      return
    }

    await UserModel.query().delete().where({
      id: req.params.userId,
    })

    res.send({ result: user })
  })
  app.get(
    "/users/:userId",
    validate({
      params: {
        userId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const { userId } = req.params
      const user = await db("users").where({ id: userId }).first()

      if (!user) {
        res.status(404).send({ error: "User not found" })
        return
      }

      res.send({ result: user })
    }
  )
}

export default prepareUsersRoutes
