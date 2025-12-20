export function GET() {
  console.log("--- Test cront ---", process.env);
  return Response.json({ env: process.env });
}
