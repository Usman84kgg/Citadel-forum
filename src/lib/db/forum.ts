import { supabase } from "./supabase";

export const forumDB = {
  async getThreads(forumSlug: string) {
    const { data: forum } = await supabase.from("forums").select("id").eq("slug", forumSlug).single();
    if (!forum) return [];

    const { data } = await supabase
      .from("threads")
      .select("*")
      .eq("forum_id", forum.id)
      .order("is_pinned", { ascending: false })
      .order("last_post_at", { ascending: false });

    return data || [];
  },

  async getThread(threadId: string) {
    const { data } = await supabase.from("threads").select("*").eq("id", threadId).single();
    if (data) {
      await supabase.rpc("increment_view", { thread_id: threadId });
    }
    return data;
  },

  async getPosts(threadId: string) {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    return data || [];
  },

  async createThread(data: { forumSlug: string; title: string; content: string; authorId: string }) {
    const { data: forum } = await supabase.from("forums").select("id").eq("slug", data.forumSlug).single();
    if (!forum) return null;

    const { data: thread } = await supabase.from("threads").insert({
      forum_id: forum.id,
      author_id: data.authorId,
      title: data.title,
      content: data.content,
      slug: data.title.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
    }).select().single();

    return thread;
  },

  async createPost(data: { threadId: string; content: string; authorId: string }) {
    const { data: post } = await supabase.from("posts").insert({
      thread_id: data.threadId,
      author_id: data.authorId,
      content: data.content,
    }).select().single();

    return post;
  },

  async thankPost(postId: string, userId: string) {
    // Проверяем, есть ли уже реакция
    const { data: existing } = await supabase
      .from("reactions")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single();

    if (existing) {
      await supabase.from("reactions").delete().eq("id", existing.id);
      return { action: "removed" };
    }

    await supabase.from("reactions").insert({
      post_id: postId,
      user_id: userId,
      type: "thanks",
    });

    return { action: "added" };
  },
};