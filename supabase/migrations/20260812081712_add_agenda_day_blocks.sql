create table public.bloqueos_agenda (
  id bigint generated always as identity primary key,
  doctor_id integer not null references public.doctores(id) on delete cascade,
  date date not null,
  reason text not null check (char_length(btrim(reason)) between 1 and 120),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  constraint bloqueos_agenda_doctor_date_key unique (doctor_id, date)
);

alter table public.bloqueos_agenda enable row level security;

revoke all on table public.bloqueos_agenda from anon;
revoke all on sequence public.bloqueos_agenda_id_seq from anon;
grant select, insert, update, delete on table public.bloqueos_agenda to authenticated;
grant usage, select on sequence public.bloqueos_agenda_id_seq to authenticated;
grant select, insert, update, delete on table public.bloqueos_agenda to service_role;
grant usage, select on sequence public.bloqueos_agenda_id_seq to service_role;

create policy "authenticated_read"
on public.bloqueos_agenda
for select
to authenticated
using ((select auth.uid()) is not null);

create policy "authenticated_insert"
on public.bloqueos_agenda
for insert
to authenticated
with check ((select auth.uid()) = created_by);

create policy "authenticated_update"
on public.bloqueos_agenda
for update
to authenticated
using ((select auth.uid()) is not null)
with check ((select auth.uid()) is not null);

create policy "authenticated_delete"
on public.bloqueos_agenda
for delete
to authenticated
using ((select auth.uid()) is not null);

create or replace function public.bloquear_dia_consulta(
  p_doctor_id integer,
  p_fecha date,
  p_motivo text
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  affected_count integer;
begin
  if (select auth.uid()) is null then
    raise exception 'Se requiere una sesión autenticada';
  end if;

  if p_fecha is null or p_doctor_id is null or char_length(btrim(p_motivo)) = 0 then
    raise exception 'Doctor, fecha y motivo son obligatorios';
  end if;

  insert into public.bloqueos_agenda (doctor_id, date, reason, created_by)
  values (p_doctor_id, p_fecha, btrim(p_motivo), (select auth.uid()))
  on conflict (doctor_id, date)
  do update set reason = excluded.reason;

  update public.citas
  set status = 'cancelada'
  where doctor_id = p_doctor_id
    and date = p_fecha
    and status in ('pendiente', 'confirmada', 'en_curso');

  get diagnostics affected_count = row_count;
  return affected_count;
end;
$$;

revoke all on function public.bloquear_dia_consulta(integer, date, text) from public;
revoke all on function public.bloquear_dia_consulta(integer, date, text) from anon;
grant execute on function public.bloquear_dia_consulta(integer, date, text) to authenticated;
grant execute on function public.bloquear_dia_consulta(integer, date, text) to service_role;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'bloqueos_agenda'
  ) then
    alter publication supabase_realtime add table public.bloqueos_agenda;
  end if;
end
$$;
