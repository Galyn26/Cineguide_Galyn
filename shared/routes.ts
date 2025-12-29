import { z } from 'zod';
import { insertSnapshotSchema, snapshots, analyzeRequestSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  analyze: {
    method: 'POST' as const,
    path: '/api/analyze',
    input: analyzeRequestSchema,
    responses: {
      200: z.object({
        action: z.enum(["UP", "DOWN", "LEFT", "RIGHT", "FORWARD", "BACKWARD", "OK"]),
        advice: z.string(),
      }),
      500: errorSchemas.internal,
    },
  },
  snapshots: {
    list: {
      method: 'GET' as const,
      path: '/api/snapshots',
      responses: {
        200: z.array(z.custom<typeof snapshots.$inferSelect>()),
      },
    },
  },
};
