import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function uploadAvatar(file: File): Promise<string | null> {
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("uploadAvatar")   // 👈 BU YER bucket nomi
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Supabase upload error:", error.message);
    return null;
  }

  const { data: publicUrl } = supabase.storage
    .from("uploadAvatar")
    .getPublicUrl(fileName);

  return publicUrl.publicUrl;
}