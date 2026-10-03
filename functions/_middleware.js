
export function onRequest() {
    return new Response("403 Forbidden - Site temporarily unavailable", {
      status: 403,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  }
  