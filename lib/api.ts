export type FeedSort = 'hot' | 'new' | 'top';

export type Post = {
  id: number;
  community: string;
  author: string;
  age: string;
  title: string;
  body: string;
  score: number;
  comments: number;
  tag?: string;
};

export type UserProfile = {
  username: string;
  name: string;
  bio: string;
  posts: number;
  karma: number;
  joined: string;
};

type CreatePostInput = Pick<Post, 'community' | 'title' | 'body'>;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? ''; 

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    credentials: 'include',
  });
  if (!response.ok) throw new Error(`API request failed with ${response.status}`);
  return response.json() as Promise<T>;
}

// Keep all Go API calls here so UI components never depend on backend details.
export const threadlyApi = {
  feed: (sort: FeedSort = 'hot') => request<Post[]>(`/v1/feed?sort=${sort}`),
  createPost: (input: CreatePostInput) => request<Post>('/v1/posts', { method: 'POST', body: JSON.stringify(input) }),
  vote: (postId: number, value: -1 | 0 | 1) => request<Post>(`/v1/posts/${postId}/vote`, { method: 'PUT', body: JSON.stringify({ value }) }),
  save: (postId: number) => request<void>(`/v1/posts/${postId}/saved`, { method: 'PUT' }),
  unsave: (postId: number) => request<void>(`/v1/posts/${postId}/saved`, { method: 'DELETE' }),
  profile: (username: string) => request<UserProfile>(`/v1/users/${username}`),
};
