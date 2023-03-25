export const up = async (knex) => {
  await knex.schema.createTable("pages", (table) => {
    table.increments("id")
    table.text("title").notNullable()
    table.text("content").notNullable()
    table.text("url").notNullable()
    table.text("creator").notNullable()
    table.text("modifiedBy").notNullable()
    table.text("publish").notNullable()
    table.timestamps(true, true, true)
    table.text("status").notNullable()
  })
}

export const down = async (knex) => {}
