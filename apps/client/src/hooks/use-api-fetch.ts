import { useStorage } from './use-storage';
import { useFetch } from './use-fetch';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const useApiFetch = <T>() => {
  const storage = useStorage();
  const fetch = useFetch<T>();
  const session = storage.get('session');
  const navigate = useNavigate();

  useEffect(() => {
    !session && navigate('/login');
  }, [session]);

  if (!session) {
    return {
      ...fetch,
      post: () => Promise.resolve(),

      get: () => Promise.resolve(),
      put: () => Promise.resolve(),
      delete: () => Promise.resolve(),
    };
  }

  const sessionToken = JSON.parse(session).token;

  const post = async (url: string, data: unknown) =>
    fetch.fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: sessionToken,
        'Content-Type': 'application/json',
      },
    });

  const get = async (url: string) =>
    fetch.fetch(url, {
      headers: {
        Authorization: sessionToken,
      },
    });

  const put = async (url: string, data: unknown) =>
    fetch.fetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: sessionToken,
        'Content-Type': 'application/json',
      },
    });

  const deleteRequest = async (url: string) =>
    fetch.fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: sessionToken,
      },
    });

  return {
    ...fetch,
    post,
    get,
    put,
    delete: deleteRequest,
  };
};
