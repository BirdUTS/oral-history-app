import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("memory_items")
    .select("id, file_name, file_path, file_type, mime_type, file_size, created_at")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const MAX_SIZE = 50 * 1024 * 1024; // 50 MB
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "檔案不可超過 50 MB" }, { status: 400 });
  }

  let fileType: "image" | "audio" | "document" = "document";
  if (file.type.startsWith("image/")) fileType = "image";
  else if (file.type.startsWith("audio/")) fileType = "audio";

  const safeName = file.name.replace(/[^a-zA-Z0-9._\-\u4e00-\u9fff]/g, "_");
  const filePath = `${id}/${Date.now()}-${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("memory-files")
    .upload(filePath, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data, error: dbError } = await supabase
    .from("memory_items")
    .insert({
      session_id: id,
      file_name: file.name,
      file_path: filePath,
      file_type: fileType,
      mime_type: file.type,
      file_size: file.size,
    })
    .select("id, file_name, file_path, file_type, mime_type, file_size, created_at")
    .single();

  if (dbError) {
    await supabase.storage.from("memory-files").remove([filePath]);
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
