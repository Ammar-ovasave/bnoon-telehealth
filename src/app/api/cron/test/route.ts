export function GET() {
  console.log("--- Test cron ---", process.env);
  return Response.json({ env: process.env });
}
