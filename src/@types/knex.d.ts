// eslint-disable-next-line no-unused-vars
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      userId: string
      session_id?: string
      name: string
    }
    meals: {
      mealId: string
      name: string
      description: string
      date: string
      hour: string
      isDiet: Boolean
    }
  }
}
