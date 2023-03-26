import NavigationMenuModel from "../db/models/NavigationMenuModel.js"
import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import {
  idValidator,
  stringValidator,
  menuItemValidator,
} from "../validators.js"

const prepareNavigationMenuRoutes = ({ app }) => {
  app.post(
    "/navigation-menu",
    auth,
    validate({
      body: {
        name: stringValidator.required(),
        content: stringValidator.required(),
        menuItems: menuItemValidator.required(),
      },
    }),
    async (req, res) => {
      const { name, content, menuItems } = req.locals.body
      const navigationMenu = await NavigationMenuModel.query()
        .insert({
          name,
          content,
          menuItems,
        })
        .returning("*")

      res.send({ result: navigationMenu })
    }
  )

  app.get("/navigation-menu", async (req, res) => {
    const navigationMenus = await NavigationMenuModel.query()
    res.send({ result: navigationMenus })
  })

  app.get(
    "/navigation-menu/:navigationMenuId",
    validate({
      params: {
        navigationMenuId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const navigationMenu = await NavigationMenuModel.query().findById(
        req.params.navigationMenuId
      )

      if (!navigationMenu) {
        res.status(404).send({ error: "not found" })
        return
      }

      res.send({ result: navigationMenu })
    }
  )

  app.patch(
    "/navigation-menu/:navigationMenuId",
    auth,
    validate({
      params: {
        navigationMenuId: idValidator.required(),
      },
      body: {
        name: stringValidator,
        content: stringValidator,
        menuItems: menuItemValidator,
      },
    }),
    async (req, res) => {
      const { name, content, menuItems } = req.locals.body
      const navigationMenu =
        await NavigationMenuModel.query().patchAndFetchById(
          req.params.navigationMenuId,
          {
            name,
            content,
            menuItems,
          }
        )

      if (!navigationMenu) {
        res.status(404).send({ error: "not found" })
        return
      }

      res.send({ result: navigationMenu })
    }
  )

  app.delete(
    "/navigation-menu/:navigationMenuId",
    auth,
    validate({
      params: {
        navigationMenuId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const navigationMenu = await NavigationMenuModel.query()
        .findById(req.params.navigationMenuId)
        .throwIfNotFound()

      await navigationMenu.$query().delete()

      res.send({ result: "success" })
    }
  )
}

export default prepareNavigationMenuRoutes
