import "dotenv/config";

console.log("Checking environment variables...");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("AUTH_SECRET:", process.env.AUTH_SECRET ? "Set" : "Not Set");
if (process.env.AUTH_SECRET) {
  console.log("AUTH_SECRET length:", process.env.AUTH_SECRET.length);
}
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not Set");
