import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/),
      hour: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
      isDiet: z.boolean(),
    })

    const sessionId = request.cookies.sessionId
    const { name, description, date, hour, isDiet } =
      createMealBodySchema.parse(request.body)

    await knex('Meals').insert({
      mealId: randomUUID(),
      name,
      description,
      date,
      hour,
      sessionId,
      isDiet,
    })

    return reply.status(201).send()
  })
  app.get('/', async () => {
    const meals = await knex('meals').select('*')

    return meals
  })

  app.get('/:id', async (request) => {
    const getMealParamsSchema = z.object({
      id: z.string(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    const meal = await knex('meals').where({ mealId: id }).select('*')

    return meal
  })

  app.put('/:id', async (request, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    const alterMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/),
      hour: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
      isDiet: z.boolean(),
    })

    const { name, description, date, hour, isDiet } = alterMealBodySchema.parse(
      request.body,
    )

    await knex('meals').where({ mealId: id }).update({
      name,
      description,
      date,
      hour,
      isDiet,
    })
    return reply.status(204).send()
  })

  app.delete('/:id', async (request, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    await knex('meals').where({ mealId: id }).delete()

    return reply.status(204).send()
  })
}
