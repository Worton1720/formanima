CREATE TYPE "MealType" AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

CREATE TABLE "FoodEntry" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "mealType" "MealType" NOT NULL,
  "calories" DOUBLE PRECISION NOT NULL,
  "protein" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "fat" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "carbs" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "weight" DOUBLE PRECISION,
  "date" DATE NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FoodEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CalorieProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "targetCalories" DOUBLE PRECISION NOT NULL DEFAULT 2000,
  "targetProtein" DOUBLE PRECISION NOT NULL DEFAULT 150,
  "targetFat" DOUBLE PRECISION NOT NULL DEFAULT 65,
  "targetCarbs" DOUBLE PRECISION NOT NULL DEFAULT 250,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CalorieProfile_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "FoodEntry" ADD CONSTRAINT "FoodEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CalorieProfile" ADD CONSTRAINT "CalorieProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX "CalorieProfile_userId_key" ON "CalorieProfile"("userId");
CREATE INDEX "FoodEntry_userId_date_idx" ON "FoodEntry"("userId", "date");
CREATE INDEX "FoodEntry_userId_mealType_date_idx" ON "FoodEntry"("userId", "mealType", "date");
