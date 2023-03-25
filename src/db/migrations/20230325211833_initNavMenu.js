export const up = async (knex) => {
  await knex.schema.createTable("navigationMenu", (table) => {
    table.increments("id")
    table.text("name").notNullable()
    table.text("content").notNullable()
    table.json("menuItems").notNullable()
  })
}

export const down = async (knex) => {}
