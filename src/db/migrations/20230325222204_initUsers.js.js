import hashPassword from "../hashPassword.js"

const [passwordHash, passwordSalt] = await hashPassword("AmIAdmin?")

export const up = async (knex) => {
  await knex.schema
    .createTable("users", (table) => {
      table.increments("id")
      table.text("firstName").notNullable()
      table.text("lastName").notNullable()
      table.text("email").notNullable().unique()
      table.text("passwordHash").notNullable()
      table.text("passwordSalt").notNullable()
      table.integer("roleId").references("id").inTable("roles")
    })
    .then(() =>
      knex("users").insert({
        firstName: "Admin",
        lastName: "Admin",
        email: "test@test.com",
        passwordHash: passwordHash,
        passwordSalt: passwordSalt,
        roleId: 1,
      })
    )
}

export const down = async (knex) => {
  await knex.schema.dropTable("users")
}
