import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './app/root';
import PostsPage from './app/posts';
import Login from './app/login';
import Signup from './app/signup';
import PostForm from './app/post-form';
import PostFormWithData from './app/post-form-with-data';
import Profile from './app/profile';
import Layout from './components/layout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'posts',
        element: <PostsPage />,
      },
      {
        path: 'posts/new',
        element: <PostForm />,
      },
      {
        path: 'posts/:postId/edit',
        element: <PostFormWithData />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
