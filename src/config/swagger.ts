import swaggerUi from 'swagger-ui-express'
import { Express } from 'express'

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Student Learning Platform API',
    version: '1.0.0',
  },
  paths: {
    '/api/health': {
      get: { summary: 'Health check', responses: { '200': { description: 'OK' } } },
    },
    '/api/auth/register': {
      post: { summary: 'Register user' },
    },
    '/api/auth/login': {
      post: { summary: 'Login user' },
    },
    '/api/learners': {
      get: { summary: 'Get learners (supports ?page=&limit=&search=)' },
      post: { summary: 'Create learner' },
    },
  },
}

export function setupSwagger(app: Express) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
}
