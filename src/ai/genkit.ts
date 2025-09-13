/**
 * @fileoverview This file initializes and configures the Genkit AI instance.
 * It sets up the necessary plugins, such as Google AI, and exports the
 * configured `ai` object for use throughout the application.
 */
'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {next} from '@genkit-ai/next';

export const ai = genkit({
  plugins: [
    googleAI(),
    next({
      // We don't want to expose the prompt for this app
      exposePrompts: false,
    }),
  ],
  // Log to the console in development
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  // Only use in-memory and console logging for development
  enableTracingAndMetrics: process.env.NODE_ENV !== 'development',
});
