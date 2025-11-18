-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "player1" TEXT NOT NULL,
    "player2" TEXT NOT NULL,
    "winner" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);
