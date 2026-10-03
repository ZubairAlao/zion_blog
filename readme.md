# Node.js 24 + Express + PostgreSQL + Prisma 6.19.3

A repeatable setup guide for the **Wordies** backend using:

-   Node.js 24 via NVM
-   Helmet
-   CORS
-   zod
-   nodemailer
-   express ratelimit
-   cookie parser
-   Express.js
-   PostgreSQL
-   Prisma 6.19.3
-   `@prisma/client` 6.19.3
-   `pg` when direct `node-postgres` access is needed


jwt or express-session, connect-pg-simple
#  Install Prisma 6.19.3

``` bash
npm install @prisma/client@6.19.3
npm install -D prisma@6.19.3
```

Verify:

``` bash
npx prisma -v
```

# Prisma Install-Script Approval

``` bash
npm install-scripts approve @prisma/engines prisma @prisma/client
```

# Install PostgreSQL

PostgreSQL installed directly on Windows

# 10. Install dotenv

If you want to use `.env` directly in your application:

``` bash
npm install dotenv
```

For an ES Module project:

``` js
import "dotenv/config";
```

# 11. Create the Prisma Folder

Run:

``` bash
npx prisma init
```

This creates the Prisma setup.

Typical structure:

``` text
wordies/
├── prisma/
│   └── schema.prisma
├── .env
├── package.json
└── src/
```

------------------------------------------------------------------------

# 12. Configure `.env`

Example:

``` env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/wordies?schema=public"
```


# 13. Configure `schema.prisma`

For a Prisma 6 project, keep the schema configuration consistent with
your installed Prisma version.

Example PostgreSQL datasource:

``` prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client"
}
```

# 14. Create Your Database Schema

Example:

``` prisma
model User {
  id       Int    @id @default(autoincrement())
  email    String @unique
  username String @unique
  password String

  progress UserProgress?
}

model WordQuestion {
  id     Int    @id @default(autoincrement())
  level  Int
  word   String
  answer String
}

model UserProgress {
  userId Int @id
  level  Int @default(1)
  score  Int @default(0)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

# 15. Create the First Migration

For local development:

``` bash
npx prisma migrate dev --name init
```

This does several things:

1.  Connects to PostgreSQL.
2.  Creates/applies the migration.
3.  Updates the database.
4.  Runs Prisma Client generation.

Check migration status:

``` bash
npx prisma migrate status
```

Connect to the Internet and run:

``` bash
npx prisma generate
```

# 18. Create the Prisma Client Instance

Create:

``` text
src/
└── config/
    └── prismaClient.js
```

Example:

``` js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
```

Then elsewhere:

``` js
import prisma from "./config/prismaClient.js";
```

# When you change the Prisma schema:

``` bash
npx prisma migrate dev --name describe_change
```

Examples:

``` bash
npx prisma migrate dev --name add_avatar
npx prisma migrate dev --name add_game_stats

npx prisma generate
```