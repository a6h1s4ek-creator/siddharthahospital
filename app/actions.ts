'use server';

import {
  smartSuggestionTool,
  type SmartSuggestionToolInput,
} from '@/ai/flows/smart-suggestion-tool';

export async function getSmartSuggestions(input: SmartSuggestionToolInput) {
  try {
    const result = await smartSuggestionTool(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}
