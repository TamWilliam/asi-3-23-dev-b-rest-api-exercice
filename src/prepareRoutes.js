import preparePagesRoutes from "./routes/preparePagesRoutes.js"
import prepareRolesRoutes from "./routes/prepareRolesRoutes.js"
import prepareUsersRoutes from "./routes/prepareUsersRoutes.js"
import prepareNavigationMenuRoutes from "./routes/prepareNavigationMenuRoutes.js"

const prepareRoutes = (ctx) => {
  preparePagesRoutes(ctx)
  prepareRolesRoutes(ctx)
  prepareUsersRoutes(ctx)
  prepareNavigationMenuRoutes(ctx)
}

export default prepareRoutes
