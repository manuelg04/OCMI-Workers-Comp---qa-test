import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPostSchema, Post } from '@qa-assessment/shared';
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
  Form,
  Input,
  SimpleFormField,
  Textarea,
} from '../components';
import { X } from 'lucide-react';
import { useApiFetch } from '../hooks';

type PostFormProps = {
  post?: Post;
  onSuccess?: () => void;
};

const PostForm = ({ post, onSuccess }: PostFormProps) => {
  const navigate = useNavigate();
  const {
    post: createPost,
    put: updatePost,
    error,
    isLoading,
  } = useApiFetch<Post>();

  const form = useForm({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: post?.title ?? '',
      content: post?.content ?? '',
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    if (post) {
      await updatePost(apiUrl(`/posts/${post.id}`), data);
    } else {
      await createPost(apiUrl('/posts'), data);
    }
    onSuccess?.();
    navigate('/posts');
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">
                {post ? 'Edit Post' : 'Create New Post'}
              </CardTitle>
              <CardDescription>
                {post
                  ? 'Update your post details below'
                  : 'Share your thoughts with the world'}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/posts')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <SimpleFormField
                name="title"
                label="Title"
                render={({ field }) => (
                  <Input placeholder="Enter your post title" {...field} />
                )}
              />

              <SimpleFormField
                name="content"
                label="Content"
                render={({ field }) => (
                  <Textarea
                    placeholder="Write your post content here..."
                    className="min-h-[200px]"
                    {...field}
                  />
                )}
              />

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{displayError(error)}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/posts')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? post
                      ? 'Updating...'
                      : 'Creating...'
                    : post
                      ? 'Update Post'
                      : 'Create Post'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostForm;
