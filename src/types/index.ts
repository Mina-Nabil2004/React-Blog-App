export type UserRole = 'BASIC' | 'ADMIN';

export interface UserPublic {
  userID: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  tagID: string;
  name: string;
}

export interface Comment {
  commentID: string;
  content: string;
  author: UserPublic;
  createdAt: string;
  updatedAt: string;
}

export interface Blog {
  blogID: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  author: UserPublic;
  tags: Tag[];
  comments: Comment[];
  published: boolean;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  user: UserPublic;
  accessToken: string;
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}
