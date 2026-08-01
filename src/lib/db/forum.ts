import { supabase } from "./supabase";

export const forumDB = {
  async getThreads(forumSlug: string) {
    const { data: forum } = await supabase
      .from("forums")
      .select("id")
      .eq("slug", forumSlug)
      .single();
    
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
    const { data } = await supabase
      .from("threads")
      .select("*")
      .eq("id", threadId)
      .single();
    
    if (data) {
      // Увеличиваем счетчик просмотров (если функция есть в базе)
      await supabase.rpc("increment_view", { thread_id: threadId }).catch(() => {});
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
    const { data: forum } = await supabase
      .from("forums")
      .select("id")
      .eq("slug", data.forumSlug)
      .single();
    
    if (!forum) return null;

    const now = new Date().toISOString();
    const { data: thread, error } = await supabase
      .from("threads")
      .insert({
        forum_id: forum.id,
        author_id: data.authorId,
        title: data.title,
        content: data.content,
        slug: data.title.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
        is_pinned: false,
        is_locked: false,
        view_count: 0,
        post_count: 1, // Первое сообщение - это сам тред
        last_post_at: now,
        created_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error("Ошибка создания темы:", error);
      return null;
    }

    return thread;
  },

  async createPost(data: { threadId: string; content: string; authorId: string }) {
    const now = new Date().toISOString();
    
    // 1. Создаем пост
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
      console.error("Ошибка создания поста:", postError);
      return null;
    }

    // 2. Обновляем статистику темы (счетчик и дата последнего сообщения)
    await supabase
      .from("threads")
      .update({ 
        post_count: supabase.rpc('increment_post_count', { thread_id: data.threadId }) // Или просто обновим вручную ниже, если rpc нет
      })
      .eq("id", data.threadId);
    
    // Более надежный способ без RPC:
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

    return post;
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