import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exist'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/),
        hour: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
        isDiet: z.boolean(),
      })

      const { name, description, date, hour, isDiet } =
        createMealBodySchema.parse(request.body)

      const checkDate = await knex('meals')
        .where('sessionId', sessionId)
        .andWhere('date', date)
        .select('date')
        .first()

      const searchCountSequence = await knex('users')
        .where('session_id', sessionId)
        .select('countSequence')
        .first()

      let countSequence = 0

      if (searchCountSequence) {
        countSequence = searchCountSequence.countSequence
      }

      if (isDiet === true && checkDate?.date === undefined) {
        countSequence += 1
      }
      console.log(countSequence)
      if (isDiet === false) {
        countSequence = 0
      }

      await knex('Meals').insert({
        mealId: randomUUID(),
        name,
        description,
        date,
        hour,
        sessionId,
        isDiet,
      })

      await knex('users')
        .where('session_id', sessionId)
        .update({ countSequence })

      await knex('users')
        .where('session_id', sessionId)
        .andWhere('sequence', '<', countSequence)
        .update({ sequence: countSequence })

      return reply.status(201).send()
    },
  )

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const meals = await knex('meals')
        .where('sessionId', sessionId)
        .select('*')

      return meals
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const getMealParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      const meal = await knex('meals').where({ mealId: id }).select('*')

      return meal
    },
  )

  app.get(
    '/total',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const totalMeals = await knex('meals')
        .where('sessionId', sessionId)
        .count('* as total')
        .first()

      return totalMeals
    },
  )

  app.get(
    '/total/dietorno/:num',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const getMealParamsSchema = z.object({
        num: z.enum(['0', '1']),
      })

      const { num } = getMealParamsSchema.parse(request.params)
      const totalMeals = await knex('meals')
        .where('sessionId', sessionId)
        .andWhere('isDiet', num)
        .count('* as total')
        .first()

      return totalMeals
    },
  )

  app.get('/sequence', async (request) => {
    const sessionId = request.cookies.sessionId

    const sequence = await knex('users')
      .where('session_id', sessionId)
      .select('sequence')
      .first()

    return sequence
  })

  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
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

      const { name, description, date, hour, isDiet } =
        alterMealBodySchema.parse(request.body)

      await knex('meals').where({ mealId: id }).update({
        name,
        description,
        date,
        hour,
        isDiet,
      })

      return reply.status(204).send()
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      await knex('meals').where({ mealId: id }).delete()

      return reply.status(204).send()
    },
  )
}
