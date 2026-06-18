alter table public.brands
add column if not exists table_qr_mode text not null default 'rotating';

alter table public.brands
drop constraint if exists brands_table_qr_mode_check;

alter table public.brands
add constraint brands_table_qr_mode_check
check (table_qr_mode in ('rotating', 'static'));

update public.brands
set table_qr_mode = case
  when config->>'qr_mode' = 'static' then 'static'
  else 'rotating'
end
where config ? 'qr_mode';
