export async function up(knex) {
  await knex.schema.createTable('conversation_participants', (table) => {
    table.bigIncrements('id').primary()
    table.bigInteger('conversation_id').unsigned().notNullable()
    table.bigInteger('user_id').unsigned().notNullable()
    table.enu('role', ['admin', 'member']).defaultTo('member')
    table.timestamp('joined_at').defaultTo(knex.fn.now())

    table.unique(['conversation_id', 'user_id'])

    table
      .foreign('conversation_id')
      .references('id')
      .inTable('conversations')
      .onDelete('CASCADE')

    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('conversation_participants');
}