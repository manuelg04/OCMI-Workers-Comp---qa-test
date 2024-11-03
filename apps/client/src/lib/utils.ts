import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ZodIssue } from 'zod';
import { ErrorType } from '../hooks';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const zodIssuesToString = (issues: ZodIssue[]) => {
  return issues.map((issue) => issue.message).join(', ');
};

export const displayError = (error: ErrorType) => {
  if (!error) {
    return null;
  }

  if ('errors' in error) {
    return zodIssuesToString(error.errors);
  }

  return error.message;
};

export const apiUrl = (url: string) => `${import.meta.env.VITE_API_URL}${url}`;

export const validJson = (json: string) => {
  try {
    JSON.parse(json);
    return true;
  } catch {
    return false;
  }
};
