import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client.js";

// better-sqlite3는 "file:" 접두사 없는 순수 경로를 받는다.
const url = (process.env.DATABASE_URL ?? "file:./dev.db").replace(/^file:/, "");
const adapter = new PrismaBetterSqlite3({ url });

export const prisma = new PrismaClient({ adapter });
