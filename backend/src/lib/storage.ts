/**
 * Essor | document storage (Supabase Storage).
 *
 * Supabase object storage replaces the previous MinIO backend: the same
 * private bucket holds exam documents. The API remains the only access path
 * (documents are read back through the backend and streamed to the client),
 * so the bucket is private and the service-role key is required.
 *
 * The exported functions mirror the old MinIO module so callers were not
 * affected by the backend swap.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "@/config/env";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const env = getEnv();
    _client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return _client;
}

/** Whether a storage error means the bucket/object does not exist. */
function isNotFound(error: { message?: string } | null): boolean {
  if (!error?.message) return false;
  const m = error.message.toLowerCase();
  return (
    m.includes("not found") ||
    m.includes("does not exist") ||
    m.includes("unable to find") ||
    m.includes("the resource was not found")
  );
}

/** Ensure the bucket exists (private). Called once on startup, non-blocking. */
export async function ensureBucket(): Promise<void> {
  const env = getEnv();
  const { error } = await getClient().storage.getBucket(
    env.SUPABASE_STORAGE_BUCKET,
  );
  if (error && !isNotFound(error)) {
    throw error;
  }
  if (error) {
    const { error: createError } = await getClient().storage.createBucket(
      env.SUPABASE_STORAGE_BUCKET,
      { public: false },
    );
    if (createError) throw createError;
  }
}

/**
 * Upload a document buffer to Supabase Storage.
 * @returns The object key (documentId) to store in the DB.
 */
export async function uploadDocument(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<{
  objectKey: string;
  size: number;
}> {
  const env = getEnv();
  const objectKey = `examens/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error } = await getClient()
    .storage.from(env.SUPABASE_STORAGE_BUCKET)
    .upload(objectKey, buffer, { contentType: mimeType, upsert: true });
  if (error) throw error;
  return { objectKey, size: buffer.length };
}

/**
 * Get a document from Supabase Storage as a Buffer.
 * Returns null when the object does not exist; other errors are thrown.
 */
export async function getDocument(objectKey: string): Promise<Buffer | null> {
  const env = getEnv();
  const { data, error } = await getClient()
    .storage.from(env.SUPABASE_STORAGE_BUCKET)
    .download(objectKey);
  if (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
  return Buffer.from(await data.arrayBuffer());
}

/**
 * Get document metadata (size, etc.) from Supabase Storage.
 */
export async function statDocument(
  objectKey: string,
): Promise<{ size: number } | null> {
  const env = getEnv();
  const { data, error } = await getClient()
    .storage.from(env.SUPABASE_STORAGE_BUCKET)
    .info(objectKey);
  if (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
  return data ? { size: data.size ?? 0 } : null;
}

/**
 * Delete a document from Supabase Storage (idempotent).
 */
export async function deleteDocument(objectKey: string): Promise<void> {
  const env = getEnv();
  const { error } = await getClient()
    .storage.from(env.SUPABASE_STORAGE_BUCKET)
    .remove([objectKey]);
  if (error && !isNotFound(error)) {
    throw error;
  }
}
