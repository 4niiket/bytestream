import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	// Prefer explicit configuration in production. Fall back to the local
	// development URL only when DATABASE_URL is not provided so local setups
	// remain functional.
	console.warn(
		"DATABASE_URL not set — falling back to the local development connection string."
	);
	connectionString = "postgresql://admin:password123@localhost:5434/bytestream?schema=public";
}

const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });

export default prisma;
