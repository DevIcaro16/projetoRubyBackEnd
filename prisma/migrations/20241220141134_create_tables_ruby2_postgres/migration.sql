-- CreateTable
CREATE TABLE "rub_emp" (
    "id" TEXT NOT NULL,
    "emp" TEXT NOT NULL,
    "cgc" TEXT NOT NULL,
    "des" TEXT NOT NULL,
    "tel" TEXT NOT NULL,
    "edr" TEXT NOT NULL,
    "bai" TEXT NOT NULL,
    "cid" TEXT NOT NULL,
    "ema" TEXT NOT NULL,
    "pwd" TEXT NOT NULL,
    "sta" TEXT NOT NULL,
    "creat_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rub_emp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rub_pla" (
    "id" TEXT NOT NULL,
    "des" TEXT NOT NULL,
    "val" DOUBLE PRECISION NOT NULL,
    "max" INTEGER NOT NULL,
    "tip" TEXT,
    "creat_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rub_pla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rub_pag" (
    "id" TEXT NOT NULL,
    "cgc" TEXT NOT NULL,
    "lib" TEXT NOT NULL,
    "dsc" DOUBLE PRECISION NOT NULL,
    "pag" DOUBLE PRECISION NOT NULL,
    "emi" TEXT NOT NULL,
    "dat" TEXT NOT NULL,
    "rea" TEXT NOT NULL,
    "ini" TEXT NOT NULL,
    "fim" TEXT NOT NULL,
    "mat" TEXT NOT NULL,
    "mestot" INTEGER NOT NULL,
    "met" TEXT NOT NULL,
    "sta" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "creat_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rub_pag_pkey" PRIMARY KEY ("id")
);
