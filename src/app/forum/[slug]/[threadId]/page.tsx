"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthorCard } from "@/components/forum/author-card";
import type { AuthorBadge, AuthorStats } from "@/lib/db/userProfile";

interface Author {
  id: string;
  username: string;
  avatar_url: string | null;
  badges: AuthorBadge[];
  stats: AuthorStats;
}

interface Post {
  id: string;
  thread_id: string;
  author_id: string;
  author?: Author | null;
  content: string;
  reaction_count: number;
  is_edited: boolean;
  created_at: string;
}

interface Thread {
  id: string;
  title: string;
  author_id: string;
  author?: Author | null;
  content: string;
  is_locked: boolean;
  view_count: number;
  created_at: string;
}

export default function ThreadPage() {
  const { slug, threadId } = useParams<{ slug: string; threadId: string }>();
  const router = useRouter();
  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null | undefined>(undefined);

  useEffect(() => {
    Promise.all([
      fetch(`/api/forum/threads?forum=${slug}`).then((r) => r.json()),
      fetch(`/api/forum/posts?threadId=${threadId}`).then((r) => r.json()),
    ]).then(([threads, postData]) => {
      const found = Array.isArray(threads)
        ? threads.find((t: Thread) => t.id === threadId)
        : null;
      setThread(found ||