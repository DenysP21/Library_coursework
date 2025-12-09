-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" SERIAL NOT NULL,
    "loan_period_days" INTEGER NOT NULL DEFAULT 14,
    "fine_per_day" DECIMAL(5,2) NOT NULL DEFAULT 5.00,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);
