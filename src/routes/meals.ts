import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/),
      hour: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    })

    const { name, description, date, hour } = createTransactionBodySchema.parse(
      request.body,
    )

    await knex('Meals').insert({
      mealId: randomUUID(),
      name,
      description,
      date,
      hour,
    })

    return reply.status(201).send()
  })
  app.get('/', async () => {
    const meals = await knex('meals').select('*')

    return meals
  })
}
