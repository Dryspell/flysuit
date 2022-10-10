import superjson from 'superjson'
import { createRouter } from '../create-router'
import { commentRouter } from './comment'
import { newsRouter } from './news'
// import { hubspotRouter } from './hubspot'
import { postRouter } from './post'
import { userRouter } from './user'

export const appRouter = createRouter()
  .transformer(superjson)
  .merge('post.', postRouter)
  .merge('comment.', commentRouter)
  .merge('user.', userRouter)
  .merge('news.', newsRouter)
// .merge('hubspot.', hubspotRouter)

export type AppRouter = typeof appRouter
