-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Minion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "worldId" TEXT,
    "locationId" TEXT,
    "targetId" TEXT,
    "destinationId" TEXT,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "currentAction" TEXT NOT NULL DEFAULT 'idle',
    "atRestAction" TEXT NOT NULL DEFAULT 'idle',
    "team" TEXT NOT NULL DEFAULT 'blue',
    "ownerId" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Minion_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Minion_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Minion_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Minion_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Minion_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Minion" ("atRestAction", "created_at", "currentAction", "destinationId", "experience", "id", "locationId", "name", "ownerId", "targetId", "team", "updated_at", "version", "worldId") SELECT "atRestAction", "created_at", "currentAction", "destinationId", "experience", "id", "locationId", "name", "ownerId", "targetId", "team", "updated_at", "version", "worldId" FROM "Minion";
DROP TABLE "Minion";
ALTER TABLE "new_Minion" RENAME TO "Minion";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
