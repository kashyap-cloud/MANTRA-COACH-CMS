import { supabase } from "@/integrations/supabase/client";

export async function checkSupabaseConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("categories").select("id").limit(1);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Supabase Connection Check Failed:", err);
    return { success: false, error: err.message };
  }
}

export interface ContentItem {
  id: string;
  contentType: string;
  title: string;
  category: string;
  focusAreas: string[];
  contentLink: string;
  contentBody: string;
  thumbnailUrl: string;
  duration: string;
  description: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export const CONTENT_TYPES = [
  "Audio",
  "Video",
  "Reading",
  "Exercise",
  "Collection",
];

// Presets for the CMS
export const CATEGORIES = [
  "Balance",
  "Communication",
  "Empowerment",
  "Performance",
  "Presence",
  "Purpose",
];

export const FOCUS_AREAS = [
  "Appreciation",
  "Authenticity",
  "Centeredness",
  "Collaboration",
  "Communication",
  "Conflict Management",
  "Delegation",
  "Emotional Intelligence",
  "Emotional Regulation",
  "Feedback",
  "Goal Setting",
  "Growth Mindset",
  "Mindfulness",
  "Motivation",
  "Problem Solving",
  "Resilience",
  "Time Management",
  "Values",
  "Vision",
];

export async function getContent(page = 0, pageSize = 20): Promise<ContentItem[]> {
  const start = page * pageSize;
  const end = start + pageSize - 1;

  const { data, error } = await supabase
    .from("academy_content")
    .select(`
      id,
      content_type,
      title,
      duration,
      is_published,
      created_at,
      updated_at,
      categories(name)
    `)
    .order("created_at", { ascending: false })
    .range(start, end);

  if (error) {
    console.error("Error fetching content:", error);
    return [];
  }

  return data.map((item: any) => ({
    id: item.id,
    contentType: item.content_type.charAt(0).toUpperCase() + item.content_type.slice(1),
    title: item.title,
    category: item.categories?.name || "Uncategorized",
    focusAreas: [],
    contentLink: "",
    contentBody: "",
    thumbnailUrl: "",
    duration: item.duration || "",
    description: "",
    published: item.is_published,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
}

export async function getContentById(id: string): Promise<ContentItem | undefined> {
  const { data, error } = await supabase
    .from("academy_content")
    .select(`
      *,
      categories(name),
      content_focus_areas(focus_areas(name))
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching content by id:", error);
    return undefined;
  }

  return {
    id: data.id,
    contentType: data.content_type.charAt(0).toUpperCase() + data.content_type.slice(1),
    title: data.title,
    category: data.categories?.name || "Uncategorized",
    focusAreas: data.content_focus_areas?.map((fa: any) => fa.focus_areas?.name).filter(Boolean) || [],
    contentLink: data.content_link || "",
    contentBody: data.content_body || "",
    thumbnailUrl: data.thumbnail_url || "",
    duration: data.duration || "",
    description: data.description || "",
    published: data.is_published,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function saveContent(item: ContentItem): Promise<void> {
  const isExisting = !!item.createdAt;
  let contentId = item.id;

  try {
    // 1. Parallelize Category lookup/creation and Content Payload preparation
    const categoryPromise = (async () => {
      if (!item.category) return null;
      const { data: catData, error: catError } = await supabase
        .from("categories")
        .select("id")
        .eq("name", item.category)
        .maybeSingle();

      if (catData) return catData.id;

      const { data: newCat, error: newCatError } = await supabase
        .from("categories")
        .insert({ name: item.category })
        .select()
        .maybeSingle();

      if (newCatError) throw newCatError;
      return newCat?.id;
    })();

    const [category_id] = await Promise.all([categoryPromise]);

    const contentPayload = {
      title: item.title,
      description: item.description,
      content_type: item.contentType.toLowerCase(),
      content_link: item.contentLink,
      content_body: item.contentBody,
      thumbnail_url: item.thumbnailUrl,
      duration: item.duration,
      is_published: item.published,
      category_id: category_id,
      updated_at: new Date().toISOString(),
    };

    // 2. Perform Content Upsert
    console.log("Saving content payload:", contentPayload);
    if (isExisting) {
      const { error } = await supabase.from("academy_content").update(contentPayload).eq("id", item.id);
      if (error) {
        console.error("Supabase Update Error:", error);
        throw error;
      }
    } else {
      const { data: inserted, error } = await supabase
        .from("academy_content")
        .insert(contentPayload)
        .select()
        .single(); // Use single() to catch cases where insert might fail to return data

      if (error) {
        console.error("Supabase Insert Error:", error);
        throw error;
      }
      if (!inserted) {
        throw new Error("Insert succeeded but no data was returned. Check RLS policies.");
      }
      contentId = inserted.id;
    }

    // 3. Optimized Focus Area Sync
    if (contentId) {
      console.log("Syncing focus areas for contentId:", contentId);
      // Run deletion of old links and lookup/creation of new FAs in parallel
      const deleteOldLinks = supabase.from("content_focus_areas").delete().eq("content_id", contentId);

      const getOrCreateFocusAreas = Promise.all(item.focusAreas.map(async (areaName) => {
        const { data: faData, error: faLookupError } = await supabase
          .from("focus_areas")
          .select("id")
          .eq("name", areaName)
          .maybeSingle();

        if (faData) return faData.id;

        const { data: newFa, error: newFaError } = await supabase
          .from("focus_areas")
          .insert({ name: areaName })
          .select()
          .maybeSingle();

        if (newFaError) {
          console.error(`Error creating focus area ${areaName}:`, newFaError);
          throw newFaError;
        }
        return newFa?.id;
      }));

      const [delResult, focusAreaIds] = await Promise.all([deleteOldLinks, getOrCreateFocusAreas]);
      if (delResult.error) {
        console.error("Error deleting old focus area links:", delResult.error);
        throw delResult.error;
      }

      // 4. Batch insert junction records
      const validIds = focusAreaIds.filter(Boolean);
      console.log("Inserting junction records for focusAreaIds:", validIds);
      if (validIds.length > 0) {
        const junctionData = validIds.map(id => ({
          content_id: contentId,
          focus_area_id: id
        }));
        const { error: junctionError } = await supabase.from("content_focus_areas").insert(junctionData);
        if (junctionError) {
          console.error("Junction insert error:", junctionError);
          throw junctionError;
        }
      }
    }
  } catch (error: any) {
    console.error("Critical error in saveContent:", error);
    // Be very specific in the error message thrown to the toast
    const detail = error.details || error.message || JSON.stringify(error);
    throw new Error(`Failed to save: ${detail}`);
  }
}

export async function deleteContent(id: string): Promise<void> {
  await supabase.from("academy_content").delete().eq("id", id);
}
