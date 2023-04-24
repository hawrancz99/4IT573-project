/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('users', (table) => {
        table.increments('id')
        table.string('name').notNullable().unique()
        table.string('salt').notNullable()
        table.string('hash').notNullable()
        table.string('token')
      })
    await knex.schema.createTable('todos', (table) => {
        table.increments('id')
        table.string('text').notNullable()
        table.boolean('done').notNullable().defaultTo(false)
        table.string('priority').notNullable()
        table.string('deadline').notNullable()
        table.integer('user_id').unsigned().nullable()
        table.foreign('user_id').references('id').inTable('users');
      })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTable('todos')
    await knex.schema.dropTable('users')
};


