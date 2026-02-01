export async function up(knex) {
   await knex.schema.createTable('conversations', (table) => {
    table.bigIncrements('id').primary()
    table.enu('type', ['private', 'group']).notNullable()
    table.string('title', 150)
    table.bigInteger('created_by').unsigned().notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())

    table
      .foreign('created_by')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('conversations');
}