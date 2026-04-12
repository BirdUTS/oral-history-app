import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  const { subject_name, subject_age, village, is_private } = await req.json();

  if (!subject_name) {
    return NextResponse.json({ error: "subject_name is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      subject_name,
      subject_age: subject_age || null,
      village: village || null,
      is_private: is_private === true,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}

export async function GET() {
  const { data, error } = await supabase
    .from("sessions")
    .select("id, subject_name, subject_age, village, created_at, is_private")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
