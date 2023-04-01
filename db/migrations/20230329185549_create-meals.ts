import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('mealId').primary()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.datetime('date').notNullable()
    table.text('sessionId').unsigned().notNullable()
    table.foreign('sessionId').references('Users.session_id').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
