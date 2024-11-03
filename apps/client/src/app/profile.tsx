import React, { useEffect, useState } from 'react';
import { useApiFetch } from '../hooks';
import { apiUrl } from '../lib';
import { Pencil, User } from 'lucide-react';
import { User as UserType } from '@qa-assessment/shared';
import {
  Alert,
  AlertDescription,
  Book,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components';
import BookSearch from '../components/book-search';

type ExtendedUser = UserType & {
  favoriteBook?: {
    key: string;
    title: string;
    author_name?: string[];
    first_publish_year?: number;
  };
};

const UserProfile = () => {
  const {
    data: user,
    error,
    isLoading,
    get,
    put,
  } = useApiFetch<ExtendedUser>();
  const [isEditingBook, setIsEditingBook] = useState(false);
  const storage = JSON.parse(localStorage.getItem('session') || '{}');
  const userId = storage.userId;

  useEffect(() => {
    if (userId) {
      get(apiUrl(`/users/${userId}`));
    }
  }, [userId]);

  const handleUpdateFavoriteBook = async (book: Book) => {
    if (!user) return;

    try {
      await put(apiUrl(`/users/${userId}`), {
        ...user,
        favoriteBook: book,
      });

      // Refresh user data
      get(apiUrl(`/users/${userId}`));
      setIsEditingBook(false);
    } catch (error) {
      console.error('Error updating favorite book:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription>Error loading profile</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-gray-100 rounded-full p-6 w-24 h-24 flex items-center justify-center mb-4">
              <User className="w-12 h-12 text-gray-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {user?.username}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-500">User ID</h3>
                <p className="mt-1 text-sm text-gray-900">{user?.id}</p>
              </div>
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-500">
                  Account Status
                </h3>
                <p className="mt-1 text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </p>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-500">
                    Favorite Book
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingBook(!isEditingBook)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
                {!isEditingBook ? (
                  <p className="mt-1 text-sm text-gray-900">
                    {user?.favoriteBook ? (
                      <>
                        {user.favoriteBook.title}
                        {user.favoriteBook.author_name?.[0] && (
                          <span className="text-gray-500">
                            {' '}
                            by {user.favoriteBook.author_name[0]}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-500">
                        No favorite book selected
                      </span>
                    )}
                  </p>
                ) : (
                  <BookSearch
                    onSelect={handleUpdateFavoriteBook}
                    open={isEditingBook}
                    onOpenChange={setIsEditingBook}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
