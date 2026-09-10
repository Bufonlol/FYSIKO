-- Appointment outcomes and initial/subsequent reporting support.
alter table public.citas
  add column if not exists patient_type character varying not null default 'subsecuente';

alter table public.citas
  drop constraint if exists citas_patient_type_check;

alter table public.citas
  add constraint citas_patient_type_check
  check (patient_type::text = any (array['inicial'::character varying, 'subsecuente'::character varying]::text[]));

-- Preserve a useful baseline for the historical agenda: the earliest recorded
-- appointment for each patient is treated as their initial visit.
with ranked_appointments as (
  select
    id,
    row_number() over (
      partition by patient_id
      order by date asc, time asc, id asc
    ) as visit_number
  from public.citas
  where patient_id is not null
)
update public.citas as appointment
set patient_type = case
  when ranked.visit_number = 1 then 'inicial'
  else 'subsecuente'
end
from ranked_appointments as ranked
where appointment.id = ranked.id;

alter table public.citas
  drop constraint if exists citas_status_check;

alter table public.citas
  add constraint citas_status_check
  check (
    status::text = any (
      array[
        'pendiente'::character varying,
        'confirmada'::character varying,
        'en_curso'::character varying,
        'cancelada'::character varying,
        'finalizada'::character varying,
        'reagendada'::character varying,
        'no_asistio'::character varying
      ]::text[]
    )
  );

create index if not exists citas_date_doctor_status_idx
  on public.citas (date, doctor_id, status);

comment on column public.citas.patient_type is
  'Clasifica la cita como visita inicial o subsecuente.';
