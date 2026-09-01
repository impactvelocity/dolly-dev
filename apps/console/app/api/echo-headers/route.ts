export async function GET(request: Request) {
  return Response.json({
    headers: Object.fromEntries(request.headers.entries()),
  });
}
