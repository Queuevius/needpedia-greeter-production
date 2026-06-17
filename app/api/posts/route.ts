export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const query = searchParams.get("q[title_cont]");
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  const token = process.env.BEARER_TOKEN;

  if (!token) {
    return Response.json({ error: "BEARER_TOKEN not configured" }, { status: 500 });
  }

  const url = new URL(`${baseUrl}/api/v1/posts`);
  if (type) url.searchParams.set("type", type);
  if (query) url.searchParams.set("q[title_cont]", query);

  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
