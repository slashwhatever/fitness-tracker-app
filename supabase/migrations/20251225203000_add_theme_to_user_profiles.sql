alter table "public"."user_profiles" add column "theme" text not null default 'system'::text;

alter table "public"."user_profiles" add constraint "user_profiles_theme_check" CHECK ((theme = ANY (ARRAY['light'::text, 'dark'::text, 'system'::text])));
