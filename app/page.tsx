'use client';

import { type FormEvent, useState } from 'react';
import type { Post } from '../lib/api';

const starterPosts: Post[] = [
  { id: 1, community: 'aws-builders', author: 'cloud_cadet', age: '2h', title: 'Finally shipped my first app on AWS 🎉', body: 'React on the front, a tiny Go API behind API Gateway, and DynamoDB for the data. The architecture is simple, but watching that first request come back felt incredible.', score: 128, comments: 24, tag: 'Showcase' },
  { id: 2, community: 'golang', author: 'bytebloom', age: '5h', title: 'What I wish I knew before building my first Go API', body: 'Keep the handlers boring. Put business logic somewhere testable, pass context everywhere, and make graceful shutdown part of day one—not a cleanup task.', score: 86, comments: 31, tag: 'Discussion' },
  { id: 3, community: 'webdev', author: 'pixel_nomad', age: '8h', title: 'Small detail, big difference: design your empty states', body: 'An empty feed should still tell people where they are, what belongs there, and the one action that gets them moving.', score: 54, comments: 12 },
];

const communities = [['A', 'aws-builders', '42k'], ['G', 'golang', '218k'], ['R', 'reactjs', '387k'], ['W', 'webdev', '1.2m']];

export default function Home() {
  const [posts, setPosts] = useState(starterPosts);
  const [votes, setVotes] = useState<Record<number, -1 | 0 | 1>>({});
  const [sort, setSort] = useState<'Hot' | 'New' | 'Top'>('Hot');
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [view, setView] = useState<'feed' | 'saved' | 'profile'>('feed');
  const [showComposer, setShowComposer] = useState(false);

  const displayedPosts = posts
    .filter((post) => view !== 'saved' || saved.has(post.id))
    .filter((post) => `${post.title} ${post.body} ${post.community} ${post.author}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sort === 'Top' ? b.score - a.score : sort === 'New' ? b.id - a.id : (b.score + b.comments * 2) - (a.score + a.comments * 2));

  function vote(postId: number, direction: -1 | 1) {
    const previous = votes[postId] ?? 0;
    const next = previous === direction ? 0 : direction;
    setVotes((current) => ({ ...current, [postId]: next }));
    setPosts((current) => current.map((post) => post.id === postId ? { ...post, score: post.score - previous + next } : post));
  }

  function toggleSaved(postId: number) {
    setSaved((current) => {
      const next = new Set(current);
      if (next.has(postId)) next.delete(postId); else next.add(postId);
      return next;
    });
  }

  function createPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') ?? '').trim();
    const body = String(form.get('body') ?? '').trim();
    const community = String(form.get('community') ?? 'aws-builders');
    if (!title || !body) return;
    setPosts((current) => [{ id: Date.now(), community, author: 'junobuilds', age: 'now', title, body, score: 1, comments: 0, tag: 'New' }, ...current]);
    setView('feed');
    setSort('New');
    setShowComposer(false);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" onClick={() => setView('feed')} aria-label="Threadly home"><span className="brand-mark">t/</span><span>threadly</span></a>
        <label className="search"><span aria-hidden="true">⌕</span><input aria-label="Search Threadly" placeholder="Search communities and posts" value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>⌘ K</kbd></label>
        <div className="top-actions"><button className="icon-button" aria-label="Notifications">♢</button><button className="create-button" onClick={() => setShowComposer(true)}><span>＋</span> Create</button><button className="avatar-button" onClick={() => setView('profile')} aria-label="Open profile">JP</button></div>
      </header>

      <div className="layout" id="top">
        <aside className="left-nav">
          <nav aria-label="Main navigation"><button className={`nav-item ${view === 'feed' ? 'active' : ''}`} onClick={() => setView('feed')}><span>⌂</span>Home</button><button className="nav-item" onClick={() => { setView('feed'); setSort('Top'); }}><span>↗</span>Popular</button><button className={`nav-item ${view === 'saved' ? 'active' : ''}`} onClick={() => setView('saved')}><span>◇</span>Saved <b>{saved.size || ''}</b></button></nav>
          <div className="nav-divider" />
          <div className="nav-heading"><span>Communities</span><button aria-label="Add community">＋</button></div>
          <div className="community-list">
            {communities.map(([letter, name, members]) => <button className="community-link" onClick={() => { setQuery(name); setView('feed'); }} key={name}><span className={`community-avatar community-${letter.toLowerCase()}`}>{letter}</span><span><strong>t/{name}</strong><small>{members} members</small></span></button>)}
          </div>
          <p className="nav-footer">About · Guidelines · Privacy<br />Threadly © 2026</p>
        </aside>

        <main className="feed">
          <section className="welcome-card"><div><p className="eyebrow">{view === 'profile' ? 'BUILDER PROFILE' : view === 'saved' ? 'YOUR READING LIST' : 'YOUR DAILY FRONT PAGE'}</p><h1>{view === 'profile' ? 'Juno Park' : view === 'saved' ? 'Saved for later.' : 'Good afternoon, Juno.'}</h1><p>{view === 'profile' ? 'Learning AWS in public · Building with React and Go.' : view === 'saved' ? `${saved.size} ${saved.size === 1 ? 'post' : 'posts'} ready when you are.` : 'Fresh ideas from the communities you follow.'}</p></div><div className="welcome-art" aria-hidden="true"><span>{view === 'profile' ? 'JP' : '☁'}</span><b>{'{ }'}</b></div></section>
          <div className="feed-toolbar"><div className="sort-tabs" aria-label="Sort posts">{(['Hot', 'New', 'Top'] as const).map((option) => <button className={sort === option ? 'selected' : ''} onClick={() => setSort(option)} key={option}>{option === 'Hot' ? '⌁ ' : option === 'New' ? '✦ ' : '↑ '}{option}</button>)}</div><button className="view-button" aria-label="Change feed layout">▤⌄</button></div>
          <div className="post-list">
            {displayedPosts.map((post) => <article className="post-card" key={post.id}>
              <div className="vote-column"><button className={votes[post.id] === 1 ? 'up active' : 'up'} onClick={() => vote(post.id, 1)} aria-label={`Upvote ${post.title}`}>↑</button><strong>{post.score}</strong><button className={votes[post.id] === -1 ? 'down active' : 'down'} onClick={() => vote(post.id, -1)} aria-label={`Downvote ${post.title}`}>↓</button></div>
              <div className="post-content"><div className="post-meta"><span className="mini-avatar">{post.community[0].toUpperCase()}</span><strong>t/{post.community}</strong><span>· Posted by u/{post.author} · {post.age}</span></div><h2>{post.title}</h2>{post.tag && <span className="tag">{post.tag}</span>}<p>{post.body}</p><div className="post-actions"><button>◯ <span>{post.comments} comments</span></button><button onClick={() => navigator.clipboard?.writeText(`${location.origin}/posts/${post.id}`)}>↗ <span>Share</span></button><button className={saved.has(post.id) ? 'saved' : ''} onClick={() => toggleSaved(post.id)}>{saved.has(post.id) ? '◆' : '◇'} <span>{saved.has(post.id) ? 'Saved' : 'Save'}</span></button><button aria-label="More actions">•••</button></div></div>
            </article>)}
            {displayedPosts.length === 0 && <div className="empty-state"><span>{view === 'saved' ? '◇' : '⌕'}</span><h2>{view === 'saved' ? 'Nothing saved yet' : 'No threads found'}</h2><p>{view === 'saved' ? 'Save a useful post and it will wait for you here.' : 'Try another search or clear your filters.'}</p>{query && <button onClick={() => setQuery('')}>Clear search</button>}</div>}
          </div>
        </main>

        <aside className="right-rail">
          <section className="side-card profile-card"><div className="profile-cover" /><div className="profile-body"><div className="large-avatar">JP</div><p className="eyebrow">YOUR PROFILE</p><h2>Juno Park</h2><p className="handle">u/junobuilds</p><div className="profile-stats"><span><strong>1,284</strong><small>Karma</small></span><span><strong>12</strong><small>Posts</small></span><span><strong>Mar 2026</strong><small>Joined</small></span></div><button className="outline-button" onClick={() => setView('profile')}>View profile</button></div></section>
          <section className="side-card trending-card"><div className="card-title"><h2>Trending today</h2><span>↗</span></div><ol><li><span>01</span><div><strong>#AWSreInvent</strong><small>12.4k posts</small></div></li><li><span>02</span><div><strong>Go 1.25</strong><small>8.1k posts</small></div></li><li><span>03</span><div><strong>React Server Components</strong><small>6.7k posts</small></div></li><li><span>04</span><div><strong>#BuildInPublic</strong><small>5.2k posts</small></div></li></ol></section>
        </aside>
      </div>
      {showComposer && <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowComposer(false)}><section className="composer" role="dialog" aria-modal="true" aria-labelledby="composer-title" onMouseDown={(event) => event.stopPropagation()}><div className="composer-head"><div><p className="eyebrow">START A CONVERSATION</p><h2 id="composer-title">Create a post</h2></div><button onClick={() => setShowComposer(false)} aria-label="Close composer">×</button></div><form onSubmit={createPost}><label>Community<select name="community" defaultValue="aws-builders">{communities.map(([, name]) => <option key={name} value={name}>t/{name}</option>)}</select></label><label>Title<input name="title" maxLength={160} placeholder="What do you want to share?" autoFocus required /></label><label>Body<textarea name="body" rows={6} placeholder="Add context, details, or a question…" required /></label><div className="composer-actions"><button type="button" className="outline-button" onClick={() => setShowComposer(false)}>Cancel</button><button className="publish-button" type="submit">Publish post</button></div></form></section></div>}
    </div>
  );
}
