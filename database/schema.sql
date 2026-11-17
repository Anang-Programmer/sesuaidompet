--
-- PostgreSQL database dump
--

\restrict AqPJx0f85OrCQSIAgB2bAuLZgogB9vxcEM0S6cYzfYIc4I6PAcEIUfVODFEa4tz

-- Dumped from database version 17.11
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  insert into public.users (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'user'
  );
  return new;
end;
$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;


--
-- Name: rls_auto_enable(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.rls_auto_enable() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
  tbl name;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        SELECT c.relname INTO tbl FROM pg_catalog.pg_class c WHERE c.oid = cmd.objid;
        EXECUTE format('alter table if exists %I.%I enable row level security', cmd.schema_name, tbl);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: calculation_histories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calculation_histories (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    title text DEFAULT 'Perhitungan SAW'::text NOT NULL,
    max_budget bigint,
    weights_used jsonb NOT NULL,
    top_smartphone_name text NOT NULL,
    top_score numeric(5,4) NOT NULL,
    results_snapshot jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT calculation_histories_max_budget_check CHECK ((max_budget > 0))
);


--
-- Name: calculation_histories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.calculation_histories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: calculation_histories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.calculation_histories_id_seq OWNED BY public.calculation_histories.id;


--
-- Name: criteria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.criteria (
    id integer NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    field text NOT NULL,
    type text NOT NULL,
    weight numeric(4,3) NOT NULL,
    unit text,
    CONSTRAINT criteria_type_check CHECK ((type = ANY (ARRAY['cost'::text, 'benefit'::text]))),
    CONSTRAINT criteria_weight_check CHECK (((weight >= (0)::numeric) AND (weight <= (1)::numeric)))
);


--
-- Name: criteria_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.criteria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: criteria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.criteria_id_seq OWNED BY public.criteria.id;


--
-- Name: smartphones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.smartphones (
    id integer NOT NULL,
    user_id uuid,
    name text NOT NULL,
    price bigint,
    camera_mp numeric,
    ram_gb integer,
    battery_mah integer,
    storage_gb integer,
    antutu integer,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT smartphones_antutu_check CHECK ((antutu > 0)),
    CONSTRAINT smartphones_battery_mah_check CHECK ((battery_mah > 0)),
    CONSTRAINT smartphones_camera_mp_check CHECK ((camera_mp > (0)::numeric)),
    CONSTRAINT smartphones_price_check CHECK ((price > 0)),
    CONSTRAINT smartphones_ram_gb_check CHECK ((ram_gb > 0)),
    CONSTRAINT smartphones_storage_gb_check CHECK ((storage_gb > 0))
);


--
-- Name: smartphones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.smartphones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: smartphones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.smartphones_id_seq OWNED BY public.smartphones.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    email text NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'user'::text])))
);


--
-- Name: calculation_histories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculation_histories ALTER COLUMN id SET DEFAULT nextval('public.calculation_histories_id_seq'::regclass);


--
-- Name: criteria id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.criteria ALTER COLUMN id SET DEFAULT nextval('public.criteria_id_seq'::regclass);


--
-- Name: smartphones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.smartphones ALTER COLUMN id SET DEFAULT nextval('public.smartphones_id_seq'::regclass);


--
-- Name: calculation_histories calculation_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculation_histories
    ADD CONSTRAINT calculation_histories_pkey PRIMARY KEY (id);


--
-- Name: criteria criteria_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.criteria
    ADD CONSTRAINT criteria_code_key UNIQUE (code);


--
-- Name: criteria criteria_field_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.criteria
    ADD CONSTRAINT criteria_field_key UNIQUE (field);


--
-- Name: criteria criteria_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.criteria
    ADD CONSTRAINT criteria_pkey PRIMARY KEY (id);


--
-- Name: smartphones smartphones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.smartphones
    ADD CONSTRAINT smartphones_pkey PRIMARY KEY (id);


--
-- Name: smartphones unique_smartphone_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.smartphones
    ADD CONSTRAINT unique_smartphone_name UNIQUE (name);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: calculation_histories calculation_histories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculation_histories
    ADD CONSTRAINT calculation_histories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: smartphones smartphones_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.smartphones
    ADD CONSTRAINT smartphones_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: users admin manage users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin manage users" ON public.users TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: criteria admin write criteria; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin write criteria" ON public.criteria TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: smartphones admin write smartphones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin write smartphones" ON public.smartphones TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: criteria authenticated read criteria; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "authenticated read criteria" ON public.criteria FOR SELECT TO authenticated USING (true);


--
-- Name: calculation_histories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.calculation_histories ENABLE ROW LEVEL SECURITY;

--
-- Name: criteria; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.criteria ENABLE ROW LEVEL SECURITY;

--
-- Name: smartphones read master or own smartphones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "read master or own smartphones" ON public.smartphones FOR SELECT TO authenticated USING (((user_id IS NULL) OR (user_id = auth.uid()) OR public.is_admin()));


--
-- Name: users read own or admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "read own or admin" ON public.users FOR SELECT TO authenticated USING (((auth.uid() = id) OR public.is_admin()));


--
-- Name: calculation_histories read own or admin histories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "read own or admin histories" ON public.calculation_histories FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR public.is_admin()));


--
-- Name: smartphones; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.smartphones ENABLE ROW LEVEL SECURITY;

--
-- Name: smartphones user delete own smartphones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "user delete own smartphones" ON public.smartphones FOR DELETE TO authenticated USING ((user_id = auth.uid()));


--
-- Name: calculation_histories user insert own histories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "user insert own histories" ON public.calculation_histories FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- Name: smartphones user insert own smartphones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "user insert own smartphones" ON public.smartphones FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- Name: calculation_histories user or admin delete histories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "user or admin delete histories" ON public.calculation_histories FOR DELETE TO authenticated USING (((user_id = auth.uid()) OR public.is_admin()));


--
-- Name: smartphones user update own smartphones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "user update own smartphones" ON public.smartphones FOR UPDATE TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict AqPJx0f85OrCQSIAgB2bAuLZgogB9vxcEM0S6cYzfYIc4I6PAcEIUfVODFEa4tz

