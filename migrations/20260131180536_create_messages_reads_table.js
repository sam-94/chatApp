export async function up(knex) {
  await knex.schema.createTable('message_reads', (table) => {
    table.bigIncrements('id').primary()
    table.bigInteger('message_id').unsigned().notNullable()
    table.bigInteger('user_id').unsigned().notNullable()
    table.timestamp('read_at').defaultTo(knex.fn.now())

    table.unique(['message_id', 'user_id'])

    table
      .foreign('message_id')
      .references('id')
      .inTable('messages')
      .onDelete('CASCADE')

    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('message_reads');
}