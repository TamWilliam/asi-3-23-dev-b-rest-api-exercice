export const up = async (knex) => {
  await knex.schema
    .createTable("roles", (table) => {
      table.increments("id")
      table.text("name").notNullable()
      table.json("permissions").notNullable()
    })
    .then(() =>
      knex("roles").insert([
        {
          id: 1,
          name: "admin",
          permissions: {
            users: "crud",
            roles: "crud",
            pages: "crud",
            navigationMenus: "crud",
          },
        },
        {
          id: 2,
          name: "manager",
          permissions: {
            users: "",
            roles: "",
            pages: "crud",
            navigationMenus: "crud",
          },
        },
        {
          id: 3,
          name: "editor",
          permissions: {
            users: "",
            roles: "",
            pages: "crud",
            navigationMenus: "r",
          },
        },
      ])
    )
}

export const down = async (knex) => {
  await knex.schema.dropTable("roles")
}
