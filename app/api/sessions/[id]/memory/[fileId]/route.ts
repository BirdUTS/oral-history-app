import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const { id, fileId } = await params;

  const { data: item, error: fetchError } = await supabase
    .from("memory_items")
    .select("file_path")
    .eq("id", fileId)
    .eq("session_id", id)
    .single();

  if (fetchError || !item) {
    return NextResponse.json({ error: "找不到檔案" }, { status: 404 });
  }

  await supabase.storage.from("memory-files").remove([item.file_path]);

  const { error: dbError } = await supabase
    .from("memory_items")
    .delete()
    .eq("id", fileId);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
