--
-- PostgreSQL database dump
--

\restrict CkkK1kOycrF4nW4dSu47md2asn7esIHQkhtLS051a8iQ4NNiPLL3ufRUVJPvnYS

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
-- Data for Name: calculation_histories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.calculation_histories (id, user_id, title, max_budget, weights_used, top_smartphone_name, top_score, results_snapshot, created_at) FROM stdin;
1	6dc7e37f-762b-47a0-aad4-4966fb844740	Tes Rekomendasi SAW	\N	[{"code": "C1", "name": "Harga", "type": "cost", "rawWeight": 0.229, "normalizedWeight": 0.229}, {"code": "C2", "name": "Kamera", "type": "benefit", "rawWeight": 0.077, "normalizedWeight": 0.077}, {"code": "C3", "name": "RAM", "type": "benefit", "rawWeight": 0.265, "normalizedWeight": 0.265}, {"code": "C4", "name": "Baterai", "type": "benefit", "rawWeight": 0.177, "normalizedWeight": 0.177}, {"code": "C5", "name": "Kapasitas Penyimpanan", "type": "benefit", "rawWeight": 0.152, "normalizedWeight": 0.152}, {"code": "C6", "name": "Prosesor (AnTuTu)", "type": "benefit", "rawWeight": 0.1, "normalizedWeight": 0.1}]	Poco X7 Pro 5G	0.9309	{"weightSum": 1, "hasilAkhir": [{"code": "A2", "name": "Poco X7 Pro 5G", "rank": 1, "price": 4655806, "totalScore": 0.9308714285714286}, {"code": "A3", "name": "Motorola Edge 70 5G", "rank": 2, "price": 5589528, "totalScore": 0.8058884205191588}, {"code": "A1", "name": "Vivo T4 Pro 5G (8GB RAM + 256GB)", "rank": 3, "price": 5819806, "totalScore": 0.8049462598282506}, {"code": "A4", "name": "Vivo V70 FE", "rank": 4, "price": 6945006, "totalScore": 0.7854748046149901}, {"code": "A5", "name": "Vivo T5 Ultra", "rank": 5, "price": 7758060, "totalScore": 0.7743893121335893}], "matriksAwal": [{"code": "A1", "name": "Vivo T4 Pro 5G (8GB RAM + 256GB)", "values": {"C1": 5819806, "C2": 50, "C3": 8, "C4": 6500, "C5": 256, "C6": 409000}}, {"code": "A2", "name": "Poco X7 Pro 5G", "values": {"C1": 4655806, "C2": 50, "C3": 8, "C4": 6550, "C5": 256, "C6": 1934662}}, {"code": "A3", "name": "Motorola Edge 70 5G", "values": {"C1": 5589528, "C2": 50, "C3": 8, "C4": 5000, "C5": 256, "C6": 1015000}}, {"code": "A4", "name": "Vivo V70 FE", "values": {"C1": 6945006, "C2": 200, "C3": 8, "C4": 7000, "C5": 128, "C6": 715000}}, {"code": "A5", "name": "Vivo T5 Ultra", "values": {"C1": 7758060, "C2": 50, "C3": 8, "C4": 6200, "C5": 256, "C6": 850076}}], "nilaiMaxMin": [{"max": 7758060, "min": 4655806, "code": "C1", "name": "Harga", "type": "cost", "unit": "Rupiah", "field": "price", "extrema": 4655806, "extremaLabel": "Min"}, {"max": 200, "min": 50, "code": "C2", "name": "Kamera", "type": "benefit", "unit": "MP", "field": "camera_mp", "extrema": 200, "extremaLabel": "Max"}, {"max": 8, "min": 8, "code": "C3", "name": "RAM", "type": "benefit", "unit": "GB", "field": "ram_gb", "extrema": 8, "extremaLabel": "Max"}, {"max": 7000, "min": 5000, "code": "C4", "name": "Baterai", "type": "benefit", "unit": "mAh", "field": "battery_mah", "extrema": 7000, "extremaLabel": "Max"}, {"max": 256, "min": 128, "code": "C5", "name": "Kapasitas Penyimpanan", "type": "benefit", "unit": "GB", "field": "storage_gb", "extrema": 256, "extremaLabel": "Max"}, {"max": 1934662, "min": 409000, "code": "C6", "name": "Prosesor (AnTuTu)", "type": "benefit", "unit": "skor", "field": "antutu", "extrema": 1934662, "extremaLabel": "Max"}], "rincianPreferensi": [{"code": "A1", "name": "Vivo T4 Pro 5G (8GB RAM + 256GB)", "totalScore": 0.8049462598282506, "weightedValues": {"C1": 0.18319847328244274, "C2": 0.01925, "C3": 0.265, "C4": 0.16435714285714284, "C5": 0.152, "C6": 0.021140643688665}}, {"code": "A2", "name": "Poco X7 Pro 5G", "totalScore": 0.9308714285714286, "weightedValues": {"C1": 0.229, "C2": 0.01925, "C3": 0.265, "C4": 0.16562142857142856, "C5": 0.152, "C6": 0.1}}, {"code": "A3", "name": "Motorola Edge 70 5G", "totalScore": 0.8058884205191588, "weightedValues": {"C1": 0.1907459044842427, "C2": 0.01925, "C3": 0.265, "C4": 0.12642857142857142, "C5": 0.152, "C6": 0.052463944606344674}}, {"code": "A4", "name": "Vivo V70 FE", "totalScore": 0.7854748046149901, "weightedValues": {"C1": 0.15351744462135813, "C2": 0.077, "C3": 0.265, "C4": 0.177, "C5": 0.076, "C6": 0.036957359993631964}}, {"code": "A5", "name": "Vivo T5 Ultra", "totalScore": 0.7743893121335893, "weightedValues": {"C1": 0.13742863215803952, "C2": 0.01925, "C3": 0.265, "C4": 0.15677142857142856, "C5": 0.152, "C6": 0.04393925140412124}}], "matriksNormalisasi": [{"code": "A1", "name": "Vivo T4 Pro 5G (8GB RAM + 256GB)", "values": {"C1": 0.7999933331111037, "C2": 0.25, "C3": 1, "C4": 0.9285714285714286, "C5": 1, "C6": 0.21140643688664998}}, {"code": "A2", "name": "Poco X7 Pro 5G", "values": {"C1": 1, "C2": 0.25, "C3": 1, "C4": 0.9357142857142857, "C5": 1, "C6": 1}}, {"code": "A3", "name": "Motorola Edge 70 5G", "values": {"C1": 0.8329515479661252, "C2": 0.25, "C3": 1, "C4": 0.7142857142857143, "C5": 1, "C6": 0.5246394460634467}}, {"code": "A4", "name": "Vivo V70 FE", "values": {"C1": 0.6703818542417386, "C2": 1, "C3": 1, "C4": 1, "C5": 0.5, "C6": 0.3695735999363196}}, {"code": "A5", "name": "Vivo T5 Ultra", "values": {"C1": 0.6001250312578145, "C2": 0.25, "C3": 1, "C4": 0.8857142857142857, "C5": 1, "C6": 0.4393925140412124}}], "bobotTernormalisasi": [{"id": 1, "code": "C1", "name": "Harga", "type": "cost", "unit": "Rupiah", "field": "price", "weight": 0.229, "rawWeight": 0.229, "normalizedWeight": 0.229}, {"id": 2, "code": "C2", "name": "Kamera", "type": "benefit", "unit": "MP", "field": "camera_mp", "weight": 0.077, "rawWeight": 0.077, "normalizedWeight": 0.077}, {"id": 3, "code": "C3", "name": "RAM", "type": "benefit", "unit": "GB", "field": "ram_gb", "weight": 0.265, "rawWeight": 0.265, "normalizedWeight": 0.265}, {"id": 4, "code": "C4", "name": "Baterai", "type": "benefit", "unit": "mAh", "field": "battery_mah", "weight": 0.177, "rawWeight": 0.177, "normalizedWeight": 0.177}, {"id": 5, "code": "C5", "name": "Kapasitas Penyimpanan", "type": "benefit", "unit": "GB", "field": "storage_gb", "weight": 0.152, "rawWeight": 0.152, "normalizedWeight": 0.152}, {"id": 6, "code": "C6", "name": "Prosesor (AnTuTu)", "type": "benefit", "unit": "skor", "field": "antutu", "weight": 0.1, "rawWeight": 0.1, "normalizedWeight": 0.1}], "wasWeightNormalized": false}	2026-11-12 17:02:31.090866+00
2	e140d29c-c602-489f-a631-4e12adaa1ea9	Rekomendasi Smartphone SAW (13 Nov 2026)	\N	[{"code": "C1", "name": "Harga", "type": "cost", "rawWeight": 0.229, "normalizedWeight": 0.229}, {"code": "C2", "name": "Kamera", "type": "benefit", "rawWeight": 0.077, "normalizedWeight": 0.077}, {"code": "C3", "name": "RAM", "type": "benefit", "rawWeight": 0.265, "normalizedWeight": 0.265}, {"code": "C4", "name": "Baterai", "type": "benefit", "rawWeight": 0.177, "normalizedWeight": 0.177}, {"code": "C5", "name": "Kapasitas Penyimpanan", "type": "benefit", "rawWeight": 0.152, "normalizedWeight": 0.152}, {"code": "C6", "name": "Prosesor (AnTuTu)", "type": "benefit", "rawWeight": 0.1, "normalizedWeight": 0.1}]	Realme C55	0.9051	{"weightSum": 1, "hasilAkhir": [{"code": "A2", "name": "Realme C55", "rank": 1, "price": 2199000, "totalScore": 0.9050928218021178}, {"code": "A1", "name": "Oppo A77s", "rank": 2, "price": 1637090, "totalScore": 0.8550133928571427}, {"code": "A3", "name": "Samsung Galaxy A54", "rank": 3, "price": 5999000, "totalScore": 0.7406489337806301}], "matriksAwal": [{"code": "A1", "name": "Oppo A77s", "values": {"C1": 1637090, "C2": 50, "C3": 8, "C4": 5000, "C5": 128, "C6": 268000}}, {"code": "A2", "name": "Realme C55", "values": {"C1": 2199000, "C2": 64, "C3": 8, "C4": 4880, "C5": 256, "C6": 380000}}, {"code": "A3", "name": "Samsung Galaxy A54", "values": {"C1": 5999000, "C2": 50, "C3": 8, "C4": 5000, "C5": 128, "C6": 560000}}], "nilaiMaxMin": [{"max": 5999000, "min": 1637090, "code": "C1", "name": "Harga", "type": "cost", "unit": "Rupiah", "field": "price", "extrema": 1637090, "extremaLabel": "Min"}, {"max": 64, "min": 50, "code": "C2", "name": "Kamera", "type": "benefit", "unit": "MP", "field": "camera_mp", "extrema": 64, "extremaLabel": "Max"}, {"max": 8, "min": 8, "code": "C3", "name": "RAM", "type": "benefit", "unit": "GB", "field": "ram_gb", "extrema": 8, "extremaLabel": "Max"}, {"max": 5000, "min": 4880, "code": "C4", "name": "Baterai", "type": "benefit", "unit": "mAh", "field": "battery_mah", "extrema": 5000, "extremaLabel": "Max"}, {"max": 256, "min": 128, "code": "C5", "name": "Kapasitas Penyimpanan", "type": "benefit", "unit": "GB", "field": "storage_gb", "extrema": 256, "extremaLabel": "Max"}, {"max": 560000, "min": 268000, "code": "C6", "name": "Prosesor (AnTuTu)", "type": "benefit", "unit": "skor", "field": "antutu", "extrema": 560000, "extremaLabel": "Max"}], "rincianPreferensi": [{"code": "A1", "name": "Oppo A77s", "totalScore": 0.8550133928571427, "weightedValues": {"C1": 0.229, "C2": 0.06015625, "C3": 0.265, "C4": 0.177, "C5": 0.076, "C6": 0.04785714285714286}}, {"code": "A2", "name": "Realme C55", "totalScore": 0.9050928218021178, "weightedValues": {"C1": 0.170483678944975, "C2": 0.077, "C3": 0.265, "C4": 0.172752, "C5": 0.152, "C6": 0.06785714285714287}}, {"code": "A3", "name": "Samsung Galaxy A54", "totalScore": 0.7406489337806301, "weightedValues": {"C1": 0.06249268378063011, "C2": 0.06015625, "C3": 0.265, "C4": 0.177, "C5": 0.076, "C6": 0.1}}], "matriksNormalisasi": [{"code": "A1", "name": "Oppo A77s", "values": {"C1": 1, "C2": 0.78125, "C3": 1, "C4": 1, "C5": 0.5, "C6": 0.4785714285714286}}, {"code": "A2", "name": "Realme C55", "values": {"C1": 0.7444702137335152, "C2": 1, "C3": 1, "C4": 0.976, "C5": 1, "C6": 0.6785714285714286}}, {"code": "A3", "name": "Samsung Galaxy A54", "values": {"C1": 0.27289381563593934, "C2": 0.78125, "C3": 1, "C4": 1, "C5": 0.5, "C6": 1}}], "bobotTernormalisasi": [{"id": 1, "code": "C1", "name": "Harga", "type": "cost", "unit": "Rupiah", "field": "price", "weight": 0.229, "rawWeight": 0.229, "normalizedWeight": 0.229}, {"id": 2, "code": "C2", "name": "Kamera", "type": "benefit", "unit": "MP", "field": "camera_mp", "weight": 0.077, "rawWeight": 0.077, "normalizedWeight": 0.077}, {"id": 3, "code": "C3", "name": "RAM", "type": "benefit", "unit": "GB", "field": "ram_gb", "weight": 0.265, "rawWeight": 0.265, "normalizedWeight": 0.265}, {"id": 4, "code": "C4", "name": "Baterai", "type": "benefit", "unit": "mAh", "field": "battery_mah", "weight": 0.177, "rawWeight": 0.177, "normalizedWeight": 0.177}, {"id": 5, "code": "C5", "name": "Kapasitas Penyimpanan", "type": "benefit", "unit": "GB", "field": "storage_gb", "weight": 0.152, "rawWeight": 0.152, "normalizedWeight": 0.152}, {"id": 6, "code": "C6", "name": "Prosesor (AnTuTu)", "type": "benefit", "unit": "skor", "field": "antutu", "weight": 0.1, "rawWeight": 0.1, "normalizedWeight": 0.1}], "wasWeightNormalized": false}	2026-11-13 08:41:01.448067+00
3	6dc7e37f-762b-47a0-aad4-4966fb844740	Rekomendasi Smartphone SAW (14 Nov 2026)	\N	[{"code": "C1", "name": "Harga", "type": "cost", "rawWeight": 0.229, "normalizedWeight": 0.229}, {"code": "C2", "name": "Kamera", "type": "benefit", "rawWeight": 0.077, "normalizedWeight": 0.077}, {"code": "C3", "name": "RAM", "type": "benefit", "rawWeight": 0.265, "normalizedWeight": 0.265}, {"code": "C4", "name": "Baterai", "type": "benefit", "rawWeight": 0.177, "normalizedWeight": 0.177}, {"code": "C5", "name": "Kapasitas Penyimpanan", "type": "benefit", "rawWeight": 0.152, "normalizedWeight": 0.152}, {"code": "C6", "name": "Prosesor (AnTuTu)", "type": "benefit", "rawWeight": 0.1, "normalizedWeight": 0.1}]	Infinix GT 20 Pro	0.9072	{"weightSum": 1, "hasilAkhir": [{"code": "A2", "name": "Infinix GT 20 Pro", "rank": 1, "price": 4999000, "totalScore": 0.9071596551055239}, {"code": "A1", "name": "Poco X6 Pro", "rank": 2, "price": 3199000, "totalScore": 0.86625}], "matriksAwal": [{"code": "A1", "name": "Poco X6 Pro", "values": {"C1": 3199000, "C2": 50, "C3": 8, "C4": 5100, "C5": 128, "C6": 1396547}}, {"code": "A2", "name": "Infinix GT 20 Pro", "values": {"C1": 4999000, "C2": 200, "C3": 8, "C4": 5000, "C5": 256, "C6": 1300000}}], "nilaiMaxMin": [{"max": 4999000, "min": 3199000, "code": "C1", "name": "Harga", "type": "cost", "unit": "Rupiah", "field": "price", "extrema": 3199000, "extremaLabel": "Min"}, {"max": 200, "min": 50, "code": "C2", "name": "Kamera", "type": "benefit", "unit": "MP", "field": "camera_mp", "extrema": 200, "extremaLabel": "Max"}, {"max": 8, "min": 8, "code": "C3", "name": "RAM", "type": "benefit", "unit": "GB", "field": "ram_gb", "extrema": 8, "extremaLabel": "Max"}, {"max": 5100, "min": 5000, "code": "C4", "name": "Baterai", "type": "benefit", "unit": "mAh", "field": "battery_mah", "extrema": 5100, "extremaLabel": "Max"}, {"max": 256, "min": 128, "code": "C5", "name": "Kapasitas Penyimpanan", "type": "benefit", "unit": "GB", "field": "storage_gb", "extrema": 256, "extremaLabel": "Max"}, {"max": 1396547, "min": 1300000, "code": "C6", "name": "Prosesor (AnTuTu)", "type": "benefit", "unit": "skor", "field": "antutu", "extrema": 1396547, "extremaLabel": "Max"}], "rincianPreferensi": [{"code": "A1", "name": "Poco X6 Pro", "totalScore": 0.86625, "weightedValues": {"C1": 0.229, "C2": 0.01925, "C3": 0.265, "C4": 0.177, "C5": 0.076, "C6": 0.1}}, {"code": "A2", "name": "Infinix GT 20 Pro", "totalScore": 0.9071596551055239, "weightedValues": {"C1": 0.14654350870174035, "C2": 0.077, "C3": 0.265, "C4": 0.17352941176470588, "C5": 0.152, "C6": 0.09308673463907768}}], "matriksNormalisasi": [{"code": "A1", "name": "Poco X6 Pro", "values": {"C1": 1, "C2": 0.25, "C3": 1, "C4": 1, "C5": 0.5, "C6": 1}}, {"code": "A2", "name": "Infinix GT 20 Pro", "values": {"C1": 0.6399279855971194, "C2": 1, "C3": 1, "C4": 0.9803921568627451, "C5": 1, "C6": 0.9308673463907767}}], "bobotTernormalisasi": [{"id": 1, "code": "C1", "name": "Harga", "type": "cost", "unit": "Rupiah", "field": "price", "weight": 0.229, "rawWeight": 0.229, "normalizedWeight": 0.229}, {"id": 2, "code": "C2", "name": "Kamera", "type": "benefit", "unit": "MP", "field": "camera_mp", "weight": 0.077, "rawWeight": 0.077, "normalizedWeight": 0.077}, {"id": 3, "code": "C3", "name": "RAM", "type": "benefit", "unit": "GB", "field": "ram_gb", "weight": 0.265, "rawWeight": 0.265, "normalizedWeight": 0.265}, {"id": 4, "code": "C4", "name": "Baterai", "type": "benefit", "unit": "mAh", "field": "battery_mah", "weight": 0.177, "rawWeight": 0.177, "normalizedWeight": 0.177}, {"id": 5, "code": "C5", "name": "Kapasitas Penyimpanan", "type": "benefit", "unit": "GB", "field": "storage_gb", "weight": 0.152, "rawWeight": 0.152, "normalizedWeight": 0.152}, {"id": 6, "code": "C6", "name": "Prosesor (AnTuTu)", "type": "benefit", "unit": "skor", "field": "antutu", "weight": 0.1, "rawWeight": 0.1, "normalizedWeight": 0.1}], "wasWeightNormalized": false}	2026-11-14 15:00:54.25992+00
4	6dc7e37f-762b-47a0-aad4-4966fb844740	Rekomendasi Smartphone SAW (14 Nov 2026)	\N	[{"code": "C1", "name": "Harga", "type": "cost", "rawWeight": 0.229, "normalizedWeight": 0.229}, {"code": "C2", "name": "Kamera", "type": "benefit", "rawWeight": 0.077, "normalizedWeight": 0.077}, {"code": "C3", "name": "RAM", "type": "benefit", "rawWeight": 0.265, "normalizedWeight": 0.265}, {"code": "C4", "name": "Baterai", "type": "benefit", "rawWeight": 0.177, "normalizedWeight": 0.177}, {"code": "C5", "name": "Kapasitas Penyimpanan", "type": "benefit", "rawWeight": 0.152, "normalizedWeight": 0.152}, {"code": "C6", "name": "Prosesor (AnTuTu)", "type": "benefit", "rawWeight": 0.1, "normalizedWeight": 0.1}]	Infinix GT 20 Pro	0.9072	{"weightSum": 1, "hasilAkhir": [{"code": "A2", "name": "Infinix GT 20 Pro", "rank": 1, "price": 4999000, "totalScore": 0.9071596551055239}, {"code": "A1", "name": "Poco X6 Pro", "rank": 2, "price": 3199000, "totalScore": 0.86625}], "matriksAwal": [{"code": "A1", "name": "Poco X6 Pro", "values": {"C1": 3199000, "C2": 50, "C3": 8, "C4": 5100, "C5": 128, "C6": 1396547}}, {"code": "A2", "name": "Infinix GT 20 Pro", "values": {"C1": 4999000, "C2": 200, "C3": 8, "C4": 5000, "C5": 256, "C6": 1300000}}], "nilaiMaxMin": [{"max": 4999000, "min": 3199000, "code": "C1", "name": "Harga", "type": "cost", "unit": "Rupiah", "field": "price", "extrema": 3199000, "extremaLabel": "Min"}, {"max": 200, "min": 50, "code": "C2", "name": "Kamera", "type": "benefit", "unit": "MP", "field": "camera_mp", "extrema": 200, "extremaLabel": "Max"}, {"max": 8, "min": 8, "code": "C3", "name": "RAM", "type": "benefit", "unit": "GB", "field": "ram_gb", "extrema": 8, "extremaLabel": "Max"}, {"max": 5100, "min": 5000, "code": "C4", "name": "Baterai", "type": "benefit", "unit": "mAh", "field": "battery_mah", "extrema": 5100, "extremaLabel": "Max"}, {"max": 256, "min": 128, "code": "C5", "name": "Kapasitas Penyimpanan", "type": "benefit", "unit": "GB", "field": "storage_gb", "extrema": 256, "extremaLabel": "Max"}, {"max": 1396547, "min": 1300000, "code": "C6", "name": "Prosesor (AnTuTu)", "type": "benefit", "unit": "skor", "field": "antutu", "extrema": 1396547, "extremaLabel": "Max"}], "rincianPreferensi": [{"code": "A1", "name": "Poco X6 Pro", "totalScore": 0.86625, "weightedValues": {"C1": 0.229, "C2": 0.01925, "C3": 0.265, "C4": 0.177, "C5": 0.076, "C6": 0.1}}, {"code": "A2", "name": "Infinix GT 20 Pro", "totalScore": 0.9071596551055239, "weightedValues": {"C1": 0.14654350870174035, "C2": 0.077, "C3": 0.265, "C4": 0.17352941176470588, "C5": 0.152, "C6": 0.09308673463907768}}], "matriksNormalisasi": [{"code": "A1", "name": "Poco X6 Pro", "values": {"C1": 1, "C2": 0.25, "C3": 1, "C4": 1, "C5": 0.5, "C6": 1}}, {"code": "A2", "name": "Infinix GT 20 Pro", "values": {"C1": 0.6399279855971194, "C2": 1, "C3": 1, "C4": 0.9803921568627451, "C5": 1, "C6": 0.9308673463907767}}], "bobotTernormalisasi": [{"id": 1, "code": "C1", "name": "Harga", "type": "cost", "unit": "Rupiah", "field": "price", "weight": 0.229, "rawWeight": 0.229, "normalizedWeight": 0.229}, {"id": 2, "code": "C2", "name": "Kamera", "type": "benefit", "unit": "MP", "field": "camera_mp", "weight": 0.077, "rawWeight": 0.077, "normalizedWeight": 0.077}, {"id": 3, "code": "C3", "name": "RAM", "type": "benefit", "unit": "GB", "field": "ram_gb", "weight": 0.265, "rawWeight": 0.265, "normalizedWeight": 0.265}, {"id": 4, "code": "C4", "name": "Baterai", "type": "benefit", "unit": "mAh", "field": "battery_mah", "weight": 0.177, "rawWeight": 0.177, "normalizedWeight": 0.177}, {"id": 5, "code": "C5", "name": "Kapasitas Penyimpanan", "type": "benefit", "unit": "GB", "field": "storage_gb", "weight": 0.152, "rawWeight": 0.152, "normalizedWeight": 0.152}, {"id": 6, "code": "C6", "name": "Prosesor (AnTuTu)", "type": "benefit", "unit": "skor", "field": "antutu", "weight": 0.1, "rawWeight": 0.1, "normalizedWeight": 0.1}], "wasWeightNormalized": false}	2026-11-14 15:23:25.947114+00
5	6dc7e37f-762b-47a0-aad4-4966fb844740	Rekomendasi Smartphone SAW (16 Nov 2026)	\N	[{"code": "C1", "name": "Harga", "type": "cost", "rawWeight": 0.229, "normalizedWeight": 0.229}, {"code": "C2", "name": "Kamera", "type": "benefit", "rawWeight": 0.077, "normalizedWeight": 0.077}, {"code": "C3", "name": "RAM", "type": "benefit", "rawWeight": 0.265, "normalizedWeight": 0.265}, {"code": "C4", "name": "Baterai", "type": "benefit", "rawWeight": 0.177, "normalizedWeight": 0.177}, {"code": "C5", "name": "Kapasitas Penyimpanan", "type": "benefit", "rawWeight": 0.152, "normalizedWeight": 0.152}, {"code": "C6", "name": "Prosesor (AnTuTu)", "type": "benefit", "rawWeight": 0.1, "normalizedWeight": 0.1}]	Poco X7 Pro 5G	0.9309	{"weightSum": 1, "hasilAkhir": [{"code": "A2", "name": "Poco X7 Pro 5G", "rank": 1, "price": 4655806, "totalScore": 0.9308714285714286}, {"code": "A3", "name": "Motorola Edge 70 5G", "rank": 2, "price": 5589528, "totalScore": 0.8058884205191588}, {"code": "A1", "name": "Vivo T4 Pro 5G (8GB RAM + 256GB)", "rank": 3, "price": 5819806, "totalScore": 0.8049462598282506}, {"code": "A4", "name": "Vivo V70 FE", "rank": 4, "price": 6945006, "totalScore": 0.7854748046149901}, {"code": "A5", "name": "Vivo T5 Ultra", "rank": 5, "price": 7758060, "totalScore": 0.7743893121335893}], "matriksAwal": [{"code": "A1", "name": "Vivo T4 Pro 5G (8GB RAM + 256GB)", "values": {"C1": 5819806, "C2": 50, "C3": 8, "C4": 6500, "C5": 256, "C6": 409000}}, {"code": "A2", "name": "Poco X7 Pro 5G", "values": {"C1": 4655806, "C2": 50, "C3": 8, "C4": 6550, "C5": 256, "C6": 1934662}}, {"code": "A3", "name": "Motorola Edge 70 5G", "values": {"C1": 5589528, "C2": 50, "C3": 8, "C4": 5000, "C5": 256, "C6": 1015000}}, {"code": "A4", "name": "Vivo V70 FE", "values": {"C1": 6945006, "C2": 200, "C3": 8, "C4": 7000, "C5": 128, "C6": 715000}}, {"code": "A5", "name": "Vivo T5 Ultra", "values": {"C1": 7758060, "C2": 50, "C3": 8, "C4": 6200, "C5": 256, "C6": 850076}}], "nilaiMaxMin": [{"max": 7758060, "min": 4655806, "code": "C1", "name": "Harga", "type": "cost", "unit": "Rupiah", "field": "price", "extrema": 4655806, "extremaLabel": "Min"}, {"max": 200, "min": 50, "code": "C2", "name": "Kamera", "type": "benefit", "unit": "MP", "field": "camera_mp", "extrema": 200, "extremaLabel": "Max"}, {"max": 8, "min": 8, "code": "C3", "name": "RAM", "type": "benefit", "unit": "GB", "field": "ram_gb", "extrema": 8, "extremaLabel": "Max"}, {"max": 7000, "min": 5000, "code": "C4", "name": "Baterai", "type": "benefit", "unit": "mAh", "field": "battery_mah", "extrema": 7000, "extremaLabel": "Max"}, {"max": 256, "min": 128, "code": "C5", "name": "Kapasitas Penyimpanan", "type": "benefit", "unit": "GB", "field": "storage_gb", "extrema": 256, "extremaLabel": "Max"}, {"max": 1934662, "min": 409000, "code": "C6", "name": "Prosesor (AnTuTu)", "type": "benefit", "unit": "skor", "field": "antutu", "extrema": 1934662, "extremaLabel": "Max"}], "rincianPreferensi": [{"code": "A1", "name": "Vivo T4 Pro 5G (8GB RAM + 256GB)", "totalScore": 0.8049462598282506, "weightedValues": {"C1": 0.18319847328244274, "C2": 0.01925, "C3": 0.265, "C4": 0.16435714285714284, "C5": 0.152, "C6": 0.021140643688665}}, {"code": "A2", "name": "Poco X7 Pro 5G", "totalScore": 0.9308714285714286, "weightedValues": {"C1": 0.229, "C2": 0.01925, "C3": 0.265, "C4": 0.16562142857142856, "C5": 0.152, "C6": 0.1}}, {"code": "A3", "name": "Motorola Edge 70 5G", "totalScore": 0.8058884205191588, "weightedValues": {"C1": 0.1907459044842427, "C2": 0.01925, "C3": 0.265, "C4": 0.12642857142857142, "C5": 0.152, "C6": 0.052463944606344674}}, {"code": "A4", "name": "Vivo V70 FE", "totalScore": 0.7854748046149901, "weightedValues": {"C1": 0.15351744462135813, "C2": 0.077, "C3": 0.265, "C4": 0.177, "C5": 0.076, "C6": 0.036957359993631964}}, {"code": "A5", "name": "Vivo T5 Ultra", "totalScore": 0.7743893121335893, "weightedValues": {"C1": 0.13742863215803952, "C2": 0.01925, "C3": 0.265, "C4": 0.15677142857142856, "C5": 0.152, "C6": 0.04393925140412124}}], "matriksNormalisasi": [{"code": "A1", "name": "Vivo T4 Pro 5G (8GB RAM + 256GB)", "values": {"C1": 0.7999933331111037, "C2": 0.25, "C3": 1, "C4": 0.9285714285714286, "C5": 1, "C6": 0.21140643688664998}}, {"code": "A2", "name": "Poco X7 Pro 5G", "values": {"C1": 1, "C2": 0.25, "C3": 1, "C4": 0.9357142857142857, "C5": 1, "C6": 1}}, {"code": "A3", "name": "Motorola Edge 70 5G", "values": {"C1": 0.8329515479661252, "C2": 0.25, "C3": 1, "C4": 0.7142857142857143, "C5": 1, "C6": 0.5246394460634467}}, {"code": "A4", "name": "Vivo V70 FE", "values": {"C1": 0.6703818542417386, "C2": 1, "C3": 1, "C4": 1, "C5": 0.5, "C6": 0.3695735999363196}}, {"code": "A5", "name": "Vivo T5 Ultra", "values": {"C1": 0.6001250312578145, "C2": 0.25, "C3": 1, "C4": 0.8857142857142857, "C5": 1, "C6": 0.4393925140412124}}], "bobotTernormalisasi": [{"id": 1, "code": "C1", "name": "Harga", "type": "cost", "unit": "Rupiah", "field": "price", "weight": 0.229, "rawWeight": 0.229, "normalizedWeight": 0.229}, {"id": 2, "code": "C2", "name": "Kamera", "type": "benefit", "unit": "MP", "field": "camera_mp", "weight": 0.077, "rawWeight": 0.077, "normalizedWeight": 0.077}, {"id": 3, "code": "C3", "name": "RAM", "type": "benefit", "unit": "GB", "field": "ram_gb", "weight": 0.265, "rawWeight": 0.265, "normalizedWeight": 0.265}, {"id": 4, "code": "C4", "name": "Baterai", "type": "benefit", "unit": "mAh", "field": "battery_mah", "weight": 0.177, "rawWeight": 0.177, "normalizedWeight": 0.177}, {"id": 5, "code": "C5", "name": "Kapasitas Penyimpanan", "type": "benefit", "unit": "GB", "field": "storage_gb", "weight": 0.152, "rawWeight": 0.152, "normalizedWeight": 0.152}, {"id": 6, "code": "C6", "name": "Prosesor (AnTuTu)", "type": "benefit", "unit": "skor", "field": "antutu", "weight": 0.1, "rawWeight": 0.1, "normalizedWeight": 0.1}], "wasWeightNormalized": false}	2026-11-15 18:15:13.033723+00
\.


--
-- Data for Name: criteria; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.criteria (id, code, name, field, type, weight, unit) FROM stdin;
1	C1	Harga	price	cost	0.229	Rupiah
6	C6	Prosesor (AnTuTu)	antutu	benefit	0.100	skor
5	C5	Kapasitas Penyimpanan	storage_gb	benefit	0.152	GB
3	C3	RAM	ram_gb	benefit	0.265	GB
2	C2	Kamera	camera_mp	benefit	0.077	MP
4	C4	Baterai	battery_mah	benefit	0.177	mAh
\.


--
-- Data for Name: smartphones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.smartphones (id, user_id, name, price, camera_mp, ram_gb, battery_mah, storage_gb, antutu, created_at) FROM stdin;
3	\N	Samsung Galaxy S25 Ultra	16743364	200	12	5000	256	3135223	2026-11-11 12:44:59.844765+00
7	\N	Honor Robot Phone	19398060	200	12	6000	512	3080247	2026-11-11 12:44:59.844765+00
4	\N	Vivo T4 Pro 5G (8GB RAM + 256GB)	5819806	50	8	6500	256	409000	2026-11-11 12:44:59.844765+00
9	\N	Motorola Edge 70 Fusion	5276606	50	8	7000	128	1015000	2026-11-11 12:44:59.844765+00
2	\N	Vivo T5x 5G	4733406	50	6	7200	128	850076	2026-11-11 12:44:59.844765+00
1	\N	Realme P2 Pro 5G	3491806	50	8	5200	128	670813	2026-11-11 12:44:59.844765+00
8	\N	Poco X7 Pro 5G	4655806	50	8	6550	256	1934662	2026-11-11 12:44:59.844765+00
5	\N	Vivo V60 5G (8GB RAM + 256GB)	6594836	50	8	6500	256	1015000	2026-11-11 12:44:59.844765+00
10	\N	Vivo V80 5G	9311806	50	8	7200	256	1010000	2026-11-11 12:44:59.844765+00
6	\N	iQOO Z11 Turbo	6206060	200	12	7600	256	3080055	2026-11-11 12:44:59.844765+00
21	\N	Motorola Edge 70 5G	5589528	50	8	5000	256	1015000	2026-11-11 16:16:35.39491+00
22	\N	Vivo V70 FE	6945006	200	8	7000	128	715000	2026-11-11 16:16:35.39491+00
23	\N	Motorola Edge 60 Pro	5856860	50	8	6000	256	1716897	2026-11-11 16:16:35.39491+00
24	\N	Oppo K13 Turbo Pro	6013806	50	8	7000	256	2302344	2026-11-11 16:16:35.39491+00
25	\N	Samsung Galaxy S25 FE	8885006	50	8	4900	128	1935000	2026-11-11 16:16:35.39491+00
26	\N	OnePlus Nord 6	8341806	50	8	9000	256	2301387	2026-11-11 16:16:35.39491+00
27	\N	OPPO Reno 14 5G	7319426	50	8	6000	256	1716408	2026-11-11 16:16:35.39491+00
28	\N	Vivo T5 Ultra	7758060	50	8	6200	256	850076	2026-11-11 16:16:35.39491+00
29	\N	Motorola Edge 60 Fusion	4849806	50	8	5500	256	640000	2026-11-11 16:16:35.39491+00
30	\N	OnePlus Nord CE 6 5G	6595806	50	8	8000	128	875000	2026-11-11 16:16:35.39491+00
31	\N	Vivo V70 5G	10475806	50	8	6500	256	1010000	2026-11-11 16:16:35.39491+00
32	\N	Motorola Edge 60 Stylus	3988640	50	8	5000	256	675600	2026-11-11 16:16:35.39491+00
33	\N	Realme P4 Power 5G	5431806	50	8	10001	128	850340	2026-11-11 16:16:35.39491+00
34	\N	Realme GT 7T	6207806	50	8	7000	256	1934110	2026-11-11 16:16:35.39491+00
35	\N	Honor WIN RT	6789806	50	12	10000	256	2710000	2026-11-11 16:16:35.39491+00
36	\N	Vivo V60e (8GB RAM + 256GB)	5721836	200	8	6500	256	715000	2026-11-11 16:16:35.39491+00
37	\N	Moto G96 5G	4461806	50	8	5500	128	675600	2026-11-11 16:16:35.39491+00
38	\N	Vivo T5x 5G (8GB RAM + 128GB)	4752806	50	8	7200	128	850076	2026-11-11 16:16:35.39491+00
39	\N	Vivo X200T	11639806	50	12	6200	256	2877052	2026-11-11 16:16:35.39491+00
40	\N	Poco X7 5G	3491806	50	8	5500	128	887398	2026-11-11 16:16:35.39491+00
41	\N	Samsung Galaxy S24 5G (Snapdragon)	8584306	50	8	4000	256	1935000	2026-11-11 16:16:35.39491+00
42	\N	Motorola Signature	10524500	50	12	5200	256	3081179	2026-11-11 16:16:35.39491+00
43	\N	Vivo X300 FE	16877806	50	12	6500	256	3080247	2026-11-11 16:16:35.39491+00
44	\N	Tecno Camon 40 Pro 5G	5042060	50	8	5200	256	640000	2026-11-11 16:16:35.39491+00
45	\N	Motorola Edge 70 Pro	7333200	50	8	6500	256	2285536	2026-11-11 16:16:35.39491+00
46	\N	Vivo T4R 5G	4461806	50	8	5700	128	848462	2026-11-11 16:16:35.39491+00
47	\N	Vivo X300	14743806	200	12	6040	256	3346543	2026-11-11 16:16:35.39491+00
48	\N	Samsung Galaxy S25 5G	12221806	50	12	4000	256	3135223	2026-11-11 16:16:35.39491+00
49	\N	Motorola Edge 70 Max	10669806	50	8	7100	256	3081179	2026-11-11 16:16:35.39491+00
50	\N	Samsung Galaxy S26 Ultra 5G	27159806	200	12	5000	256	4027702	2026-11-11 16:16:35.39491+00
51	\N	OPPO Reno 16 5G	12027806	50	8	6700	256	1457989	2026-11-11 16:16:35.39491+00
52	\N	Oppo F31 Pro 5G	5043806	50	8	7000	128	1077869	2026-11-11 16:16:35.39491+00
53	\N	Vivo T5 Pro	7079836	50	8	9020	128	1000017	2026-11-11 16:16:35.39491+00
54	\N	OPPO K14	3753706	50	6	7000	128	615625	2026-11-11 16:16:35.39491+00
55	\N	Motorola Edge 70 Fusion 5G (8GB RAM + 256 GB)	6348650	50	8	7000	256	1149292	2026-11-11 16:16:35.39491+00
56	\N	iQOO 15R	9699806	50	8	7600	256	3588128	2026-11-11 16:16:35.39491+00
57	\N	Vivo X300E	13578060	50	12	7200	256	3080247	2026-11-11 16:16:35.39491+00
58	\N	Xiaomi Redmi Turbo 5	7371806	50	8	7540	256	2086154	2026-11-11 16:16:35.39491+00
59	\N	Poco X7 Pro (12GB RAM + 256GB)	5043806	50	12	6550	256	1704330	2026-11-11 16:16:35.39491+00
60	\N	iQOO Z10 Turbo Pro	4654060	50	12	7000	256	207300	2026-11-11 16:16:35.39491+00
61	\N	OnePlus 16	17458060	200	12	9000	256	5384433	2026-11-11 16:16:35.39491+00
62	\N	Nothing Phone 3 5G	8923806	50	12	5500	256	1930244	2026-11-11 16:16:35.39491+00
63	\N	Poco M8 Power	5818060	50	6	8000	128	619773	2026-11-11 16:16:35.39491+00
64	\N	Realme GT 7	7759806	50	8	7000	256	2236357	2026-11-11 16:16:35.39491+00
65	\N	Poco X7 5G (8GB RAM + 256GB)	3879806	50	8	5500	256	704404	2026-11-11 16:16:35.39491+00
66	\N	Tecno Camon 50 Ultra	7759612	50	8	6500	256	998070	2026-11-11 16:16:35.39491+00
67	\N	OPPO Reno 16 Pro 5G	13772060	200	12	6700	256	2852066	2026-11-11 16:16:35.39491+00
68	\N	OnePlus 15	16683806	50	12	7300	256	3823060	2026-11-11 16:16:35.39491+00
69	\N	Samsung Galaxy A56 5G	6789806	50	8	5000	128	902412	2026-11-11 16:16:35.39491+00
70	\N	Google Pixel 10 5G	12920400	48	12	4970	256	1468259	2026-11-11 16:18:55.966991+00
74	e140d29c-c602-489f-a631-4e12adaa1ea9	Oppo A77s	1637090	50	8	5000	128	268000	2026-11-13 08:38:53.958828+00
75	e140d29c-c602-489f-a631-4e12adaa1ea9	Realme C55	2199000	64	8	4880	256	380000	2026-11-13 08:38:54.030987+00
76	e140d29c-c602-489f-a631-4e12adaa1ea9	Samsung Galaxy A54	5999000	50	8	5000	128	560000	2026-11-13 08:38:54.087581+00
77	e140d29c-c602-489f-a631-4e12adaa1ea9	Oppo A92	4100000	48	8	5000	128	260000	2026-11-13 08:54:45.731997+00
79	6dc7e37f-762b-47a0-aad4-4966fb844740	Poco X6 Pro	3199000	50	8	5100	128	1396547	2026-11-14 15:00:30.200482+00
80	6dc7e37f-762b-47a0-aad4-4966fb844740	Infinix GT 20 Pro	4999000	200	8	5000	256	1300000	2026-11-14 15:00:30.388403+00
82	cdd39635-bebf-4632-b2e5-53652f2b7e09	Poco M6 Pro	2199000	64	8	5000	128	451159	2026-11-15 11:08:31.670854+00
85	\N	Samsung Galaxy Note 8	2965608	12	6	3300	256	199868	2026-11-15 15:45:19.067564+00
86	\N	Infinix Smart 10	1299000	8	3	5000	64	358483	2026-11-15 15:45:19.067564+00
87	\N	POCO C75	1449000	50	6	5160	128	344773	2026-11-15 15:45:19.067564+00
88	\N	vivo Y19s	1499000	50	4	5500	64	345000	2026-11-15 15:45:19.067564+00
89	\N	Infinix Hot 50 4G	1659000	50	8	5000	128	566585	2026-11-15 15:45:19.067564+00
90	\N	vivo Y04s	1699000	13	4	6000	128	345000	2026-11-15 15:45:19.067564+00
91	\N	Samsung Galaxy A06	1699000	50	4	5000	128	338136	2026-11-15 15:45:19.067564+00
92	\N	Redmi Note 13	1899000	108	8	5000	256	464836	2026-11-15 15:45:19.067564+00
93	\N	OPPO A5i	2099000	8	4	5100	128	380000	2026-11-15 15:45:19.067564+00
94	\N	realme C71	2100000	50	4	6300	128	343932	2026-11-15 15:45:19.067564+00
95	\N	POCO M6 4G	2099000	108	8	5030	256	380000	2026-11-15 15:45:19.067564+00
96	\N	Infinix Hot 50 Pro	2159000	50	8	5000	256	562039	2026-11-15 15:45:19.067564+00
97	\N	vivo Y28	2199000	50	6	6000	128	338000	2026-11-15 15:45:19.067564+00
98	\N	Infinix Note 40	2309000	108	8	5000	256	581489	2026-11-15 15:45:19.067564+00
99	\N	Infinix Hot 50 Pro+	2369000	50	8	5000	256	585490	2026-11-15 15:45:19.067564+00
100	\N	Redmi Note 14 4G	2399000	108	8	5500	128	570767	2026-11-15 15:45:19.067564+00
101	\N	POCO M6 Pro	2499000	64	8	5000	256	563125	2026-11-15 15:45:19.067564+00
102	\N	Infinix Hot 60 Pro	2599000	50	8	5160	128	608673	2026-11-15 15:45:19.067564+00
103	\N	OPPO A6c	2699000	13	4	7000	64	465000	2026-11-15 15:45:19.067564+00
104	\N	Infinix Note 40 Pro	2859000	108	8	5000	256	625934	2026-11-15 15:45:19.067564+00
105	\N	Redmi Note 15 4G	2899000	108	6	6000	128	581234	2026-11-15 15:45:19.067564+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, role, created_at) FROM stdin;
cdd39635-bebf-4632-b2e5-53652f2b7e09	admin	admin@sesuaidompet.id	admin	2026-11-11 06:51:57.68204+00
e140d29c-c602-489f-a631-4e12adaa1ea9	Jaka Perdana	jaka@gmail.com	user	2026-11-11 08:06:47.973958+00
6dc7e37f-762b-47a0-aad4-4966fb844740	Dian	diannn201026@gmail.com	user	2026-11-12 05:04:59.392639+00
8db6fc6f-5499-4343-8b58-cad1f1ebb89d	ROLAND ANUGRAH SITANGGANG	sitanggangroland3@gmail.com	user	2026-11-12 11:56:02.135253+00
\.


--
-- Name: calculation_histories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.calculation_histories_id_seq', 5, true);


--
-- Name: criteria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.criteria_id_seq', 6, true);


--
-- Name: smartphones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.smartphones_id_seq', 106, true);


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

\unrestrict CkkK1kOycrF4nW4dSu47md2asn7esIHQkhtLS051a8iQ4NNiPLL3ufRUVJPvnYS

