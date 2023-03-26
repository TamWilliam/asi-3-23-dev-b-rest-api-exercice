import PageModel from "../db/models/PageModel.js"
import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import {
  boolValidator,
  contentValidator,
  idValidator,
  limitValidator,
  orderFieldValidator,
  orderValidator,
  pageValidator,
  titleValidator,
  statusValidator,
} from "../validators.js"

const preparePagesRoutes = ({ app }) => {
  app.post(
    "/pages",
    auth,
    validate({
      body: {
        title: titleValidator.required(),
        content: contentValidator.required(),
        status: statusValidator.required(),
      },
    }),
    async (req, res) => {
      const {
        body: { title, content, status },
        session: {
          user: { id: userId },
        },
      } = req.locals
      const page = await PageModel.query()
        .insert({
          title,
          content,
          status,
          userId,
        })
        .returning("*")

      res.send({ result: page })
    }
  )

  app.get(
    "/pages",
    validate({
      query: {
        limit: limitValidator,
        page: pageValidator,
        orderField: orderFieldValidator(["title", "content"]).default("title"),
        order: orderValidator.default("desc"),
        isPublished: boolValidator.default(true),
      },
    }),
    async (req, res) => {
      const { limit, page, orderField, order, isPublished } = req.locals.query
      const query = PageModel.query().modify("paginate", limit, page)

      if (isPublished) {
        query.whereNotNull("publishedAt")
      }

      if (orderField) {
        query.orderBy(orderField, order)
      }

      const [countResult] = await query
        .clone()
        .clearSelect()
        .clearOrder()
        .count()
      const count = Number.parseInt(countResult.count, 10)
      const pages = await query.withGraphFetched("author")

      res.send({
        result: pages,
        meta: {
          count,
        },
      })
    }
  )

  app.get(
    "/pages/:pageId",
    validate({
      params: {
        pageId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const page = await PageModel.query().findById(req.params.pageId)

      if (!page) {
        res.status(404).send({ error: "not found" })

        return
      }

      res.send({ result: page })
    }
  )

  app.patch("/pages/:pageId", async (req, res) => {
    const { title, content, status, published } = req.body
    const page = await PageModel.query().findById(req.params.pageId)

    if (!page) {
      res.status(404).send({ error: "not found" })

      return
    }

    const updatedPage = await PageModel.query()
      .update({
        ...(title ? { title } : {}),
        ...(content ? { content } : {}),
        ...(status ? { status } : {}),
        ...(published ? { published } : {}),
      })
      .where({
        id: req.params.pageId,
      })
      .returning("*")

    res.send({ result: updatedPage })
  })

  app.delete("/pages/:pageId", async (req, res) => {
    const page = await PageModel.query().findById(req.params.pageId)

    if (!page) {
      res.status(404).send({ error: "not found" })

      return
    }

    await PageModel.query().delete().where({
      id: req.params.pageId,
    })

    res.send({ result: page })
  })
}

export default preparePagesRoutes
