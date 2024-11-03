import { useParams } from 'react-router-dom';
import { useApiFetch } from '../hooks';
import { Post } from '@qa-assessment/shared';
import { useEffect } from 'react';
import { apiUrl, displayError } from '../lib';
import { Alert, AlertDescription } from '../components';
import PostForm from './post-form';

const PostFormWithData = () => {
  const { postId } = useParams();
  const { get, data: post, error, isLoading } = useApiFetch<Post>();

  useEffect(() => {
    get(apiUrl(`/posts/${postId}`));
  }, [postId]);

  if (isLoading) {
    return <div className="text-center py-8">Loading post...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{displayError(error)}</AlertDescription>
      </Alert>
    );
  }

  return <PostForm post={post ?? undefined} />;
};

export default PostFormWithData;
