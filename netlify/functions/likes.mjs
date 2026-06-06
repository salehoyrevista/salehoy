import { getStore } from "@netlify/blobs";

const STORE_NAME = "article-likes";

const jsonResponse = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (request) => {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return jsonResponse({ error: "Missing slug" }, 400);
  }

  let store;
  try {
    store = getStore({ name: STORE_NAME, consistency: "strong" });
  } catch {
    return jsonResponse({ error: "Store unavailable" }, 503);
  }

  if (request.method === "GET") {
    const data = await store.get(slug, { type: "json" }).catch(() => null);
    return jsonResponse({ count: data?.count ?? 0, slug });
  }

  if (request.method === "POST") {
    const existing = await store.get(slug, { type: "json" }).catch(() => null);
    const count = (existing?.count ?? 0) + 1;
    await store.setJSON(slug, { count });
    return jsonResponse({ count, slug });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = { path: "/api/likes" };
