import React, { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from './ui';

export type Book = {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
};

type BookSearchProps = {
  onSelect: (book: Book) => void;
  defaultValue?: Book;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const BookSearch = ({ onSelect, open, onOpenChange }: BookSearchProps) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    !open && setBooks([]);
  }, [open]);

  const searchBooks = useDebouncedCallback(async (query: string) => {
    if (query.length < 2) {
      setBooks([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`,
      );
      const data = await response.json();
      setBooks(
        data.docs.map((book: Record<string, string>) => ({
          key: book.key,
          title: book.title,
          author_name: book.author_name,
          first_publish_year: book.first_publish_year,
        })),
      );
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
    }
  }, 250);

  return (
    <>
      {open && (
        <Input
          onChange={(e) => searchBooks(e.target.value)}
          placeholder="Search for a book"
          className="mb-4"
        />
      )}
      {loading && <p className="text-gray-500 text-center">Loading...</p>}
      {books.map((book) => (
        <div
          key={book.key}
          className="cursor-pointer hover:bg-accent p-4 rounded"
          onClick={() => {
            onSelect(book);
            onOpenChange(false);
          }}
        >
          <div className="flex flex-col">
            <span>{book.title}</span>
            {book.author_name && (
              <span className="text-sm text-gray-500">
                by {book.author_name[0]}
                {book.first_publish_year && ` (${book.first_publish_year})`}
              </span>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

export default BookSearch;
