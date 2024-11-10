export interface User {
  id: string;
  username: string;
  favoriteBook?: {
    key: string;
    title: string;
    author_name: string[];
    first_publish_year?: number;
  } | null;
} 
