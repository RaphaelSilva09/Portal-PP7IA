alter table "public"."mini_livros"
add column "part_order" smallint not null default 1;

CREATE UNIQUE INDEX ebooks_order_unique
ON public.ebooks USING btree ("order");

CREATE INDEX idx_mini_livros_part_order
ON public.mini_livros USING btree (part_order);

alter table "public"."ebooks"
add constraint "ebooks_order_unique"
UNIQUE using index "ebooks_order_unique";

alter table "public"."mini_livros"
add constraint "mini_livros_part_order_check"
CHECK (((part_order >= 1) AND (part_order <= 3))) not valid;

alter table "public"."mini_livros"
validate constraint "mini_livros_part_order_check";
