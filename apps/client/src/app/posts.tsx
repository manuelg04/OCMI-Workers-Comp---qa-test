import React, { useEffect } from 'react';
import { Pencil, PlusCircle, Trash2, User } from 'lucide-react';
import { Post, User as UserType } from '@qa-assessment/shared';
import { apiUrl, displayError } from '../lib';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components';
import { useApiFetch } from '../hooks';

type ExtendedUser = UserType & {
  favoriteBook?: {
    title: string;
    author_name?: string[];
  };
};

const PostsPage = () => {
  const [users, setUsers] = React.useState<Record<string, ExtendedUser>>({});
  const navigate = useNavigate();
  const {
    get: getPosts,
    data: posts,
    error: postsError,
    isLoading: isLoadingPosts,
  } = useApiFetch<Post[]>();

  const { delete: deletePost } = useApiFetch<void>();

  const {
    get: getUser,
    error: usersError,
    isLoading: isLoadingUsers,
  } = useApiFetch<Record<string, ExtendedUser>>();

  useEffect(() => {
    getPosts(apiUrl('/posts'));
  }, []);

  useEffect(() => {
    if (posts) {
      const authorIds = [...new Set(posts.map((post) => post.authorId))];

      Promise.all(
        authorIds.map((id) =>
          getUser(apiUrl(`/users/${id}`)).then((user) => [id, user]),
        ),
      ).then((users) => setUsers(Object.fromEntries(users)));
    }
  }, [posts]);

  const handleDelete = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await deletePost(apiUrl(`/posts/${postId}`));
      getPosts(apiUrl('/posts'));
    }
  };

  const isLoading = isLoadingPosts || isLoadingUsers;
  const error = postsError || usersError;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Posts</h1>
          <Button
            className="flex items-center gap-2"
            onClick={() => navigate('/posts/new')}
          >
            <PlusCircle className="h-4 w-4" />
            Create Post
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{displayError(error)}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="text-center py-8">Loading posts...</div>
        ) : (
          <div className="grid gap-6">
            {posts?.map((post) => {
              const author = users?.[post.authorId];
              const favoriteBook = author?.favoriteBook;

              return (
                <Card key={post.id} role="article">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle>{post.title}</CardTitle>
                        <CardDescription>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{author?.username}</span>
                          </div>
                          <div className="text-sm mt-1">
                            <span className="font-medium">Favorite Book:</span>{' '}
                            {favoriteBook ? (
                              <span>
                                {favoriteBook.title}
                                {favoriteBook.author_name?.[0] &&
                                  ` by ${favoriteBook.author_name[0]}`}
                              </span>
                            ) : (
                              <span className="italic">None</span>
                            )}
                          </div>
                          <div className="text-sm mt-1">
                            Created on{' '}
                            {new Date(post.createdAt).toLocaleDateString()}
                            {post.updatedAt !== post.createdAt &&
                              ` • Updated on ${new Date(post.updatedAt).toLocaleDateString()}`}
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => navigate(`/posts/${post.id}/edit`)}
                          className="edit-button"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(post.id)}
                          className="delete-button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{post.content}</p>
                  </CardContent>
                </Card>
              );
            })}

            {posts?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No posts found. Create your first post!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsPage;
