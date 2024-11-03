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
import { loginRequestSchema, Session } from '@qa-assessment/shared';
import { useFetch, useStorage } from '../hooks';
import { apiUrl, displayError } from '../lib';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const storage = useStorage();
  const navigate = useNavigate();
  const { fetch, isLoading, error } = useFetch<Session>({
    onSuccess: (data) => {
      storage.set('session', JSON.stringify(data));
      navigate('/posts');
    },
  });

  const form = useForm({
    resolver: zodResolver(loginRequestSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (data) =>
    fetch(apiUrl('/auth/login'), {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
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
                        placeholder="Username"
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
                        placeholder="Password"
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
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Create one
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
