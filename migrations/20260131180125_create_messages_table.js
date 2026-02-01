export async function up(knex) {
    await knex.schema.createTable('messages', (table) => {
    table.bigIncrements('id').primary()
    table.bigInteger('conversation_id').unsigned().notNullable()
    table.bigInteger('sender_id').unsigned().notNullable()
    table.text('content').notNullable()
    table.enu('type', ['text', 'image', 'file']).defaultTo('text')
    table.timestamp('created_at').defaultTo(knex.fn.now())

    table
      .foreign('conversation_id')
      .references('id')
      .inTable('conversations')
      .onDelete('CASCADE')

    table
      .foreign('sender_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
  })
}


export async function down(knex) {
  await knex.schema.dropTableIfExists('messages');
}