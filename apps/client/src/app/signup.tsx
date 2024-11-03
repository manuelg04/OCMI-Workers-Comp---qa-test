import React from 'react';
import { Lock, User } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  Input,
  SimpleFormField,
} from '../components';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Session, userRegisterRequestSchema } from '@qa-assessment/shared';
import { useFetch, useStorage } from '../hooks';
import { apiUrl, displayError } from '../lib';
import { useNavigate } from 'react-router-dom';

// Extend the registration schema to include password confirmation
const signupSchema = userRegisterRequestSchema
  .extend({
    confirmPassword: z.string().min(8).max(255),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

const Signup = () => {
  const storage = useStorage();
  const navigate = useNavigate();
  const { fetch, isLoading, error } = useFetch<Session>({
    onSuccess: (data) => {
      storage.set('session', JSON.stringify(data));
      navigate('/posts');
    },
  });

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...registrationData } = data;
    return fetch(apiUrl('/users'), {
      method: 'POST',
      body: JSON.stringify(registrationData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Create an account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your details to register
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <SimpleFormField
                  name="username"
                  label="Username"
                  render={({ field }) => (
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Choose a username"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  )}
                />
              </div>
              <div className="space-y-2">
                <SimpleFormField
                  name="password"
                  label="Password"
                  render={({ field }) => (
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Choose a password"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  )}
                />
              </div>
              <div className="space-y-2">
                <SimpleFormField
                  name="confirmPassword"
                  label="Confirm Password"
                  render={({ field }) => (
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  )}
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{displayError(error)}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-gray-500">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Sign in
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
