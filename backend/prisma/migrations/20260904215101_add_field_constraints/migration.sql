-- AlterTable: aplica limites de tamanho de coluna correspondentes às regras de validação da aplicação
ALTER TABLE "clients" ALTER COLUMN "name" SET DATA TYPE VARCHAR(100);
ALTER TABLE "clients" ALTER COLUMN "cellphone" SET DATA TYPE VARCHAR(20);
ALTER TABLE "products" ALTER COLUMN "name" SET DATA TYPE VARCHAR(150);

-- CheckConstraint: valores numéricos (defesa em profundidade, espelha as validações do backend)
ALTER TABLE "products" ADD CONSTRAINT "products_price_positive" CHECK ("price" > 0);
ALTER TABLE "products" ADD CONSTRAINT "products_stock_non_negative" CHECK ("stockQuantity" >= 0);

ALTER TABLE "sales" ADD CONSTRAINT "sales_quantity_positive" CHECK ("quantity" > 0);
ALTER TABLE "sales" ADD CONSTRAINT "sales_unit_price_positive" CHECK ("unitPrice" > 0);
ALTER TABLE "sales" ADD CONSTRAINT "sales_total_price_positive" CHECK ("totalPrice" > 0);

-- CheckConstraint: formato de nome (letras/acentos + espaço/apóstrofo/hífen para cliente; + números e pontuação básica para produto)
ALTER TABLE "clients" ADD CONSTRAINT "clients_name_format"
  CHECK ("name" ~ '^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ''-]*( [A-Za-zÀ-ÖØ-öø-ÿ''-]+)*$');

ALTER TABLE "products" ADD CONSTRAINT "products_name_format"
  CHECK ("name" ~ '^[A-Za-zÀ-ÖØ-öø-ÿ0-9][A-Za-zÀ-ÖØ-öø-ÿ0-9.,''()%/-]*( [A-Za-zÀ-ÖØ-öø-ÿ0-9.,''()%/-]+)*$');

-- CheckConstraint: telefone é opcional (NULL passa livre), mas se preenchido precisa ter 10 ou 11 dígitos (DDD + número)
ALTER TABLE "clients" ADD CONSTRAINT "clients_cellphone_format"
  CHECK ("cellphone" IS NULL OR length(regexp_replace("cellphone", '[^0-9]', '', 'g')) IN (10, 11));
