import RoleModel from "../db/models/RoleModel.js"
import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import {
  boolValidator,
  idValidator,
  limitValidator,
  orderFieldValidator,
  orderValidator,
  pageValidator,
  stringValidator,
} from "../validators.js"

const prepareRolesRoutes = ({ app }) => {
  app.post(
    "/roles",
    auth,
    validate({
      body: {
        name: stringValidator.required(),
        description: stringValidator.required(),
      },
    }),
    async (req, res) => {
      const {
        body: { name, description },
      } = req.locals
      const role = await RoleModel.query()
        .insert({
          name,
          description,
        })
        .returning("*")

      res.send({ result: role })
    }
  )

  app.get(
    "/roles",
    validate({
      query: {
        limit: limitValidator,
        page: pageValidator,
        orderField: orderFieldValidator(["name", "description"]).default(
          "name"
        ),
        order: orderValidator.default("asc"),
      },
    }),
    async (req, res) => {
      const { limit, page, orderField, order } = req.locals.query
      const query = RoleModel.query().modify("paginate", limit, page)

      if (orderField) {
        query.orderBy(orderField, order)
      }

      const [countResult] = await query
        .clone()
        .clearSelect()
        .clearOrder()
        .count()
      const count = Number.parseInt(countResult.count, 10)
      const roles = await query

      res.send({
        result: roles,
        meta: {
          count,
        },
      })
    }
  )

  app.get(
    "/roles/:roleId",
    validate({
      params: {
        roleId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const role = await RoleModel.query().findById(req.params.roleId)

      if (!role) {
        res.status(404).send({ error: "not found" })

        return
      }

      res.send({ result: role })
    }
  )

  app.patch(
    "/roles/:roleId",
    auth,
    validate({
      params: {
        roleId: idValidator.required(),
      },
      body: {
        name: stringValidator,
        description: stringValidator,
      },
    }),
    async (req, res) => {
      const { name, description } = req.body
      const role = await RoleModel.query().findById(req.params.roleId)

      if (!role) {
        res.status(404).send({ error: "not found" })

        return
      }

      const updatedRole = await RoleModel.query()
        .update({
          ...(name ? { name } : {}),
          ...(description ? { description } : {}),
        })
        .where({
          id: req.params.roleId,
        })
        .returning("*")

      res.send({ result: updatedRole })
    }
  )

  app.delete(
    "/roles/:roleId",
    auth,
    validate({
      params: {
        roleId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const role = await RoleModel.query().findById(req.params.roleId)

      if (!role) {
        res.status(404).send({ error: "not found" })

        return
      }

      await RoleModel.query().deleteById(req.params.roleId)

      res.send({ result: role })
    }
  )
}

export default prepareRolesRoutes
