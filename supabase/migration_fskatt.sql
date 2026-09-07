alter table id06_register
  add column if not exists org_nr text,
  add column if not exists f_skatt boolean not null default false;
