import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { is_private } = await req.json();

  if (typeof is_private !== "boolean") {
    return NextResponse.json({ error: "is_private must be a boolean" }, { status: 400 });
  }

  const { error } = await supabase
    .from("sessions")
    .update({ is_private })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
