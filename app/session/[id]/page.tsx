import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import InterviewClient from "./InterviewClient";

interface Session {
  id: string;
  subject_name: string;
  subject_age: number | null;
  village: string | null;
}

async function getSession(id: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select("id, subject_name, subject_age, village")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Session;
}

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession(id);

  if (!session) notFound();

  return <InterviewClient session={session} />;
}
