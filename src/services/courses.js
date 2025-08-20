import { supabase } from "utils/supabase";

const LOCAL_KEY = "txapp_courses";

function isSupabaseReady() {
  return !!supabase;
}

function mapFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    numero_ordre: row.numero_ordre,
    index_depart: row.index_depart ?? "",
    index_embarquement: row.index_embarquement ?? "",
    lieu_embarquement: row.lieu_embarquement ?? "",
    heure_embarquement: row.heure_embarquement ?? "",
    index_debarquement: (row.index_debarquement ?? row.index_arrivee) ?? "",
    lieu_debarquement: (row.lieu_debarquement ?? row.lieu_arrivee) ?? "",
    heure_debarquement: (row.heure_debarquement ?? row.heure_arrivee) ?? "",
    prix_taximetre: Number(row.prix_taximetre ?? 0),
    sommes_percues: Number((row.sommes_percues ?? row.somme_percue) ?? 0),
    mode_paiement: row.mode_paiement ?? "CASH",
    client: row.client ?? "",
    remuneration_chauffeur: row.remuneration_chauffeur ?? "Indépendant",
    notes: row.notes ?? "",
    status: row.status ?? "completed",
  };
}

function mapToDb(course) {
  return {
    numero_ordre: course.numero_ordre,
    index_depart: course.index_depart || null,
    index_embarquement: course.index_embarquement || null,
    lieu_embarquement: course.lieu_embarquement || null,
    heure_embarquement: course.heure_embarquement || null,
    // Write to both potential column names for compatibility if DB has triggers/defaults; Supabase will ignore unknown columns
    index_debarquement: course.index_debarquement || null,
    index_arrivee: course.index_debarquement || null,
    lieu_debarquement: course.lieu_debarquement || null,
    lieu_arrivee: course.lieu_debarquement || null,
    heure_debarquement: course.heure_debarquement || null,
    heure_arrivee: course.heure_debarquement || null,
    prix_taximetre: course.prix_taximetre ?? null,
    sommes_percues: course.sommes_percues ?? null,
    somme_percue: course.sommes_percues ?? null,
    mode_paiement: course.mode_paiement || null,
    client: course.client || null,
    remuneration_chauffeur: course.remuneration_chauffeur || null,
    notes: course.notes || null,
    status: course.status || "completed",
  };
}

// LocalStorage fallback so the UI still works without backend.
function lsGet() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function lsSet(list) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {
    // ignore write errors (e.g., private mode)
  }
}

export async function fetchCourses() {
  if (isSupabaseReady()) {
    const { data, error } = await supabase
      .from("course")
      .select(
        "id, numero_ordre, index_depart, index_embarquement, lieu_embarquement, heure_embarquement, index_debarquement, index_arrivee, lieu_debarquement, lieu_arrivee, heure_debarquement, heure_arrivee, prix_taximetre, somme_percue, sommes_percues, mode_paiement, client, remuneration_chauffeur, notes, status"
      )
      .order("numero_ordre", { ascending: true });
    if (error) throw error;
    return (data || []).map(mapFromDb);
  }
  return lsGet();
}

export async function upsertCourse(course) {
  if (isSupabaseReady()) {
    const payload = mapToDb(course);
    if (course.id) {
      const { data, error } = await supabase
        .from("course")
        .update(payload)
        .eq("id", course.id)
        .select()
        .single();
      if (error) throw error;
      return mapFromDb(data);
    }
    const { data, error } = await supabase
      .from("course")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return mapFromDb(data);
  }
  // Fallback: localStorage
  const list = lsGet();
  const idx = list.findIndex((c) => c.id === course.id);
  let saved;
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...course };
    saved = list[idx];
  } else {
    saved = { ...course, id: course.id || Date.now() };
    list.push(saved);
  }
  lsSet(list);
  return saved;
}

export async function deleteCourse(id) {
  if (isSupabaseReady()) {
    const { error } = await supabase.from("course").delete().eq("id", id);
    if (error) throw error;
    return true;
  }
  const list = lsGet().filter((c) => c.id !== id);
  lsSet(list);
  return true;
}
