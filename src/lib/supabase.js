import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Saves a prediction record to Supabase predictions table.
 * Fallbacks to appending Instagram ID to participant name.
 */
export const savePrediction = async (participantName, participantNumber, instagramId, argentinaScore, spainScore) => {
  if (!supabase) {
    throw new Error("Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.");
  }

  let result = '';
  const arg = Number(argentinaScore);
  const esp = Number(spainScore);
  if (arg > esp) {
    result = "Argentina";
  } else if (esp > arg) {
    result = "Spain";
  } else {
    result = "Draw";
  }

  const cleanInstagram = (instagramId || '').trim();
  const displayName = cleanInstagram 
    ? `${participantName.trim()} (IG: @${cleanInstagram.replace(/^@/, '')})` 
    : participantName.trim();

  const { data, error } = await supabase
    .from("predictions")
    .insert({
      participant_name: displayName,
      participant_number: participantNumber.toString().trim(),
      argentina_score: arg,
      spain_score: esp,
      result
    })
    .select();

  if (error) throw error;
  return data;
};

/**
 * Fetches all prediction entries sorted by created_at descending.
 */
export const loadPredictions = async () => {
  if (!supabase) {
    throw new Error("Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.");
  }

  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Calculates total predictions, wins, and draws statistics.
 */
export const calculateStatistics = (predictions = []) => {
  let argentinaWins = 0;
  let spainWins = 0;
  let draws = 0;

  predictions.forEach((p) => {
    if (p.result === "Argentina") {
      argentinaWins++;
    } else if (p.result === "Spain") {
      spainWins++;
    } else if (p.result === "Draw") {
      draws++;
    }
  });

  return {
    total: predictions.length,
    argentinaWins,
    spainWins,
    draws,
  };
};

