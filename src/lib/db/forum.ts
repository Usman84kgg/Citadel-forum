import { supabase } from "./supabase";

export const forumDB = {
  async getThreads(forumSlug: string) {
    const { data: forum } = await supabase
      .from("forums")
      .select("id")
      .eq("slug", forumSlug)
      .single();
    
    if (!forum) return [];

    // Получаем темы с данными авторов
    const { data } = await supabase
      .from("threads")
      .select(`
        *,
        author:author_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq("forum_id", forum.id)
      .order("is_pinned", { ascending: false })
      .order("last_post_at", { ascending: false });

    return data || [];
  },

  async getThread(threadId: string) {
    const { data } = await supabase
      .from("threads")
      .select(`
        *,
        author:author_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq("id", threadId)
      .single();
    
    if (data) {
      const { error } = await supabase.rpc("increment_view", { thread_id: threadId });
      if (error) {
        console.warn("Функция increment_view не найдена:", error.message);
      }
    }
    return data;
  },

  async getPosts(threadId: string) {
    // Получаем посты с данными авторов
    const { data } = await supabase
      .from("posts")
      .select(`
        *,
        author:author_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    return data || [];
  },

  async createThread(data: { forumSlug: string; title: string; content: string; authorId: string }) {
    const { data: forum } = await supabase
      .from("forums")
      .select("id")
      .eq("slug", data.forumSlug)
      .single();
    
    if (!forum) {
      return { thread: null, error: { message: `Раздел "${data.forumSlug}" не найден` } };
    }

    const now = new Date().toISOString();
    const slug = data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
    
    const { data: thread, error } = await supabase
      .from("threads")
      .insert({
        forum_id: forum.id,
        author_id: data.authorId,
        title: data.title,
        content: data.content,
        slug: slug,
        is_pinned: false,
        is_locked: false,
        view_count: 0,
        post_count: 1,
        last_post_at: now,
        created_at: now,
      })
      .select()
      .single();

    return { thread, error };
  },

  async createPost(data: { threadId: string; content: string; authorId: string }) {
    const now = new Date().toISOString();
    
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        thread_id: data.threadId,
        author_id: data.authorId,
        content: data.content,
        created_at: now,
      })
      .select()
      .single();

    if (postError) {
      return { post: null, error: postError };
    }

    const { data: currentThread } = await supabase
      .from("threads")
      .select("post_count")
      .eq("id", data.threadId)
      .single();
      
    await supabase
      .from("threads")
      .update({
        post_count: (currentThread?.post_count || 0) + 1,
        last_post_at: now,
      })
      .eq("id", data.threadId);

    return { post, error: null };
  },

  async thankPost(postId: string, userId: string) {
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