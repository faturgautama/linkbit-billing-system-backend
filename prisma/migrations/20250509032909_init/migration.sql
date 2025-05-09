-- CreateTable
CREATE TABLE "xendit_payment_method" (
    "id_xendit_payment_method" SERIAL NOT NULL,
    "payment_method_type" TEXT NOT NULL,
    "payment_method_name" TEXT NOT NULL,
    "payment_method_code" TEXT NOT NULL,
    "payment_method_fee" DECIMAL(65,30) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "xendit_payment_method_pkey" PRIMARY KEY ("id_xendit_payment_method")
);
