--
-- PostgreSQL database dump
--

\restrict sxNldLaHYu6KfV8f4uYmZFd6bY16bdDxYtM7wTaOG4SsXi587KvIjDJys3bPC1Q

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10

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

ALTER TABLE IF EXISTS ONLY public.pairs DROP CONSTRAINT IF EXISTS fknnqa098q1rtohjgoaohb94ik2;
ALTER TABLE IF EXISTS ONLY public.matches DROP CONSTRAINT IF EXISTS fkmsm4kpptyns423sajyvkj7oy2;
ALTER TABLE IF EXISTS ONLY public.tournament_venues DROP CONSTRAINT IF EXISTS fkl03ewyuh3x52279quw4y7uga2;
ALTER TABLE IF EXISTS ONLY public.matches DROP CONSTRAINT IF EXISTS fkjefa4a6lw7amwftv2ae3g65lt;
ALTER TABLE IF EXISTS ONLY public.pairs DROP CONSTRAINT IF EXISTS fki4t6ouvg1dr0yw4khe8kqi0qe;
ALTER TABLE IF EXISTS ONLY public.tournament_venues DROP CONSTRAINT IF EXISTS fkhs02jaofu7grhbw96vdd2d375;
ALTER TABLE IF EXISTS ONLY public.matches DROP CONSTRAINT IF EXISTS fkeeniokyjgo5k6rmhjujatn27i;
ALTER TABLE IF EXISTS ONLY public.pairs DROP CONSTRAINT IF EXISTS fkcd2lso7yief4a04yhtlf4p6x1;
ALTER TABLE IF EXISTS ONLY public.courts DROP CONSTRAINT IF EXISTS fkc588eogjvkwv2gfs9ulycwbk1;
ALTER TABLE IF EXISTS ONLY public.matches DROP CONSTRAINT IF EXISTS fkb8pcikcjdcxnd828so8xhmhyg;
ALTER TABLE IF EXISTS ONLY public.pair_available_schedules DROP CONSTRAINT IF EXISTS fk9wqhj3lk52mocjlsoy21vqqnt;
ALTER TABLE IF EXISTS ONLY public.tournaments DROP CONSTRAINT IF EXISTS fk9lhophem2qvr91kxt2a6vui1m;
ALTER TABLE IF EXISTS ONLY public.matches DROP CONSTRAINT IF EXISTS fk9at6y4yc6k2kbtmqxkkh9xi0u;
ALTER TABLE IF EXISTS ONLY public.matches DROP CONSTRAINT IF EXISTS fk6et2welm24skyoqi9ivros056;
ALTER TABLE IF EXISTS ONLY public.tournament_groups DROP CONSTRAINT IF EXISTS fk69cxdijppe91a9f11li2pbq4;
ALTER TABLE IF EXISTS ONLY public.venues DROP CONSTRAINT IF EXISTS fk5negy4v8ln3lyxl5gwjyb8prn;
ALTER TABLE IF EXISTS ONLY public.pairs DROP CONSTRAINT IF EXISTS fk4lgj26hnd8raehi4x7mc4qj2j;
ALTER TABLE IF EXISTS ONLY public.venues DROP CONSTRAINT IF EXISTS venues_pkey;
ALTER TABLE IF EXISTS ONLY public.organizers DROP CONSTRAINT IF EXISTS uk3507nf5g1ylv098m0dkd2cruk;
ALTER TABLE IF EXISTS ONLY public.tournaments DROP CONSTRAINT IF EXISTS tournaments_pkey;
ALTER TABLE IF EXISTS ONLY public.tournament_venues DROP CONSTRAINT IF EXISTS tournament_venues_pkey;
ALTER TABLE IF EXISTS ONLY public.tournament_groups DROP CONSTRAINT IF EXISTS tournament_groups_pkey;
ALTER TABLE IF EXISTS ONLY public.players DROP CONSTRAINT IF EXISTS players_pkey;
ALTER TABLE IF EXISTS ONLY public.pairs DROP CONSTRAINT IF EXISTS pairs_pkey;
ALTER TABLE IF EXISTS ONLY public.organizers DROP CONSTRAINT IF EXISTS organizers_pkey;
ALTER TABLE IF EXISTS ONLY public.matches DROP CONSTRAINT IF EXISTS matches_pkey;
ALTER TABLE IF EXISTS ONLY public.courts DROP CONSTRAINT IF EXISTS courts_pkey;
DROP TABLE IF EXISTS public.venues;
DROP TABLE IF EXISTS public.tournaments;
DROP TABLE IF EXISTS public.tournament_venues;
DROP TABLE IF EXISTS public.tournament_groups;
DROP TABLE IF EXISTS public.players;
DROP TABLE IF EXISTS public.pairs;
DROP TABLE IF EXISTS public.pair_available_schedules;
DROP TABLE IF EXISTS public.organizers;
DROP TABLE IF EXISTS public.matches;
DROP TABLE IF EXISTS public.courts;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: courts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courts (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    venue_id uuid
);


--
-- Name: matches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.matches (
    id uuid NOT NULL,
    court_id uuid,
    group_id uuid,
    pair1_id uuid,
    pair2_id uuid,
    bracket_position integer,
    bracket_round integer,
    set1_pair1 integer,
    set1_pair2 integer,
    set2_pair1 integer,
    set2_pair2 integer,
    set3_pair1 integer,
    set3_pair2 integer,
    stage character varying(255),
    turn integer,
    tournament_id uuid,
    winner_id uuid,
    CONSTRAINT matches_stage_check CHECK (((stage)::text = ANY (ARRAY[('GROUP'::character varying)::text, ('BRACKET'::character varying)::text])))
);


--
-- Name: organizers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizers (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(255)
);


--
-- Name: pair_available_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pair_available_schedules (
    pair_id uuid NOT NULL,
    schedule character varying(255),
    CONSTRAINT pair_available_schedules_schedule_check CHECK (((schedule)::text = ANY (ARRAY[('H09_12'::character varying)::text, ('H12_15'::character varying)::text, ('H15_18'::character varying)::text, ('H18_21'::character varying)::text])))
);


--
-- Name: pairs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pairs (
    id uuid NOT NULL,
    category character varying(255),
    level character varying(255),
    schedule character varying(255),
    player1_id uuid,
    player2_id uuid,
    tournament_id uuid,
    group_id uuid,
    CONSTRAINT pairs_category_check CHECK (((category)::text = ANY (ARRAY[('A1'::character varying)::text, ('A2'::character varying)::text, ('A3'::character varying)::text, ('A4'::character varying)::text, ('A5'::character varying)::text, ('A6'::character varying)::text, ('A7'::character varying)::text, ('A8'::character varying)::text]))),
    CONSTRAINT pairs_level_check CHECK (((level)::text = ANY (ARRAY[('ALTO'::character varying)::text, ('MEDIO'::character varying)::text, ('BAJO'::character varying)::text]))),
    CONSTRAINT pairs_schedule_check CHECK (((schedule)::text = ANY (ARRAY[('H09_12'::character varying)::text, ('H12_15'::character varying)::text, ('H15_18'::character varying)::text, ('H18_21'::character varying)::text])))
);


--
-- Name: players; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.players (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    email character varying(255),
    phone character varying(255),
    category character varying(255),
    CONSTRAINT players_category_check CHECK (((category)::text = ANY (ARRAY[('A1'::character varying)::text, ('A2'::character varying)::text, ('A3'::character varying)::text, ('A4'::character varying)::text, ('A5'::character varying)::text, ('A6'::character varying)::text, ('A7'::character varying)::text, ('A8'::character varying)::text])))
);


--
-- Name: tournament_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tournament_groups (
    id uuid NOT NULL,
    category character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    tournament_id uuid NOT NULL,
    CONSTRAINT tournament_groups_category_check CHECK (((category)::text = ANY (ARRAY[('A1'::character varying)::text, ('A2'::character varying)::text, ('A3'::character varying)::text, ('A4'::character varying)::text, ('A5'::character varying)::text, ('A6'::character varying)::text, ('A7'::character varying)::text, ('A8'::character varying)::text])))
);


--
-- Name: tournament_venues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tournament_venues (
    tournament_id uuid NOT NULL,
    venue_id uuid NOT NULL
);


--
-- Name: tournaments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tournaments (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    organizer_id uuid,
    category character varying(255) NOT NULL,
    start_date date,
    CONSTRAINT tournaments_category_check CHECK (((category)::text = ANY (ARRAY[('A1'::character varying)::text, ('A2'::character varying)::text, ('A3'::character varying)::text, ('A4'::character varying)::text, ('A5'::character varying)::text, ('A6'::character varying)::text, ('A7'::character varying)::text, ('A8'::character varying)::text]))),
    CONSTRAINT tournaments_type_check CHECK (((type)::text = ANY (ARRAY[('AMERICANO'::character varying)::text, ('ESTANDAR'::character varying)::text])))
);


--
-- Name: venues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.venues (
    id uuid NOT NULL,
    address character varying(255),
    name character varying(255) NOT NULL,
    organizer_id uuid
);


--
-- Data for Name: courts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.courts (id, name, venue_id) FROM stdin;
326c3e5f-b80c-4102-9a57-05b268026a62	Cancha 1	5d6e2c26-6b35-4d10-ad0b-8694917c5cfe
6f058ee5-5d73-4f6d-b8a1-39fb0dc2bd15	Cancha 2	5d6e2c26-6b35-4d10-ad0b-8694917c5cfe
9ef639ca-1166-4d47-af85-65d837683400	Cancha 3	5d6e2c26-6b35-4d10-ad0b-8694917c5cfe
bcd4378d-4c64-4c27-880a-7f61ef95e9ad	Cancha 4	5d6e2c26-6b35-4d10-ad0b-8694917c5cfe
\.


--
-- Data for Name: matches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.matches (id, court_id, group_id, pair1_id, pair2_id, bracket_position, bracket_round, set1_pair1, set1_pair2, set2_pair1, set2_pair2, set3_pair1, set3_pair2, stage, turn, tournament_id, winner_id) FROM stdin;
39c7cefd-9142-48fb-9291-3ba21d002ada	326c3e5f-b80c-4102-9a57-05b268026a62	908925e0-262a-446e-9c1e-f24d79f02a3d	2aff7d64-c692-4e6b-b52a-e3a39ffeddfd	ae9226af-1e43-45ce-b278-020116eb6f4b	\N	\N	6	4	2	6	7	5	GROUP	6	df4f9969-d564-4da2-8c00-842baafa5337	2aff7d64-c692-4e6b-b52a-e3a39ffeddfd
6bd4feb1-b855-439b-afce-1fb76736a1f9	6f058ee5-5d73-4f6d-b8a1-39fb0dc2bd15	bd2bcbf1-a9e3-43ff-a87c-3085fc548994	efaa5763-1c8e-4d18-8c78-db28111e1922	c222618c-bcbd-46bc-870b-c422b9f27165	\N	\N	3	6	6	3	2	6	GROUP	4	df4f9969-d564-4da2-8c00-842baafa5337	c222618c-bcbd-46bc-870b-c422b9f27165
883ee4f0-c07e-4e81-bcaf-d8051dde9402	9ef639ca-1166-4d47-af85-65d837683400	bd2bcbf1-a9e3-43ff-a87c-3085fc548994	20096bd9-637a-42c5-a5ae-7c5f60ef9a1a	c222618c-bcbd-46bc-870b-c422b9f27165	\N	\N	5	7	6	3	7	5	GROUP	2	df4f9969-d564-4da2-8c00-842baafa5337	20096bd9-637a-42c5-a5ae-7c5f60ef9a1a
576215f1-600c-43eb-bce0-fbb94e37047a	326c3e5f-b80c-4102-9a57-05b268026a62	bd2bcbf1-a9e3-43ff-a87c-3085fc548994	9941acfd-d9b4-425b-bf6b-67aa976837a0	c222618c-bcbd-46bc-870b-c422b9f27165	\N	\N	7	6	3	6	7	5	GROUP	0	df4f9969-d564-4da2-8c00-842baafa5337	9941acfd-d9b4-425b-bf6b-67aa976837a0
bf8b3824-23b8-4499-bdc8-ec6a8ad2c318	9ef639ca-1166-4d47-af85-65d837683400	a6cf0c89-a4d3-40fe-b645-adea85036b11	e19be0fa-193d-4184-82dd-9cd5c063f546	88d16918-2962-4ab1-84b5-91d8f307be2e	\N	\N	6	7	3	6	\N	\N	GROUP	5	df4f9969-d564-4da2-8c00-842baafa5337	88d16918-2962-4ab1-84b5-91d8f307be2e
3e779977-839d-4ada-bc14-61506e369a4e	9ef639ca-1166-4d47-af85-65d837683400	a6cf0c89-a4d3-40fe-b645-adea85036b11	a5c8c6fc-036f-40f0-acfc-1713593705a5	88d16918-2962-4ab1-84b5-91d8f307be2e	\N	\N	5	7	5	7	\N	\N	GROUP	1	df4f9969-d564-4da2-8c00-842baafa5337	88d16918-2962-4ab1-84b5-91d8f307be2e
ad49f90b-e95b-4570-9e0b-abd62e130f8b	326c3e5f-b80c-4102-9a57-05b268026a62	908925e0-262a-446e-9c1e-f24d79f02a3d	2aff7d64-c692-4e6b-b52a-e3a39ffeddfd	b461659e-e187-4932-bbf0-9eadb8d0ed09	\N	\N	6	2	6	4	\N	\N	GROUP	1	df4f9969-d564-4da2-8c00-842baafa5337	2aff7d64-c692-4e6b-b52a-e3a39ffeddfd
50218a23-843a-4428-a4b0-24a4de42c419	6f058ee5-5d73-4f6d-b8a1-39fb0dc2bd15	908925e0-262a-446e-9c1e-f24d79f02a3d	8653f730-9196-42f5-92c7-bfab95136017	b461659e-e187-4932-bbf0-9eadb8d0ed09	\N	\N	7	6	6	4	\N	\N	GROUP	6	df4f9969-d564-4da2-8c00-842baafa5337	8653f730-9196-42f5-92c7-bfab95136017
19fbc935-4cbc-4f0a-8d3c-ee9a9713b744	326c3e5f-b80c-4102-9a57-05b268026a62	908925e0-262a-446e-9c1e-f24d79f02a3d	ae9226af-1e43-45ce-b278-020116eb6f4b	b461659e-e187-4932-bbf0-9eadb8d0ed09	\N	\N	6	2	7	5	\N	\N	GROUP	4	df4f9969-d564-4da2-8c00-842baafa5337	ae9226af-1e43-45ce-b278-020116eb6f4b
76877c59-2bb6-401e-8e2c-46597a3bbce6	bcd4378d-4c64-4c27-880a-7f61ef95e9ad	908925e0-262a-446e-9c1e-f24d79f02a3d	2aff7d64-c692-4e6b-b52a-e3a39ffeddfd	8653f730-9196-42f5-92c7-bfab95136017	\N	\N	5	7	7	6	5	7	GROUP	0	df4f9969-d564-4da2-8c00-842baafa5337	8653f730-9196-42f5-92c7-bfab95136017
e7030424-e261-493e-bd76-0ffe41bf294b	326c3e5f-b80c-4102-9a57-05b268026a62	908925e0-262a-446e-9c1e-f24d79f02a3d	ae9226af-1e43-45ce-b278-020116eb6f4b	8653f730-9196-42f5-92c7-bfab95136017	\N	\N	4	6	4	6	\N	\N	GROUP	7	df4f9969-d564-4da2-8c00-842baafa5337	8653f730-9196-42f5-92c7-bfab95136017
4ecc1c25-bc8b-4f3a-9930-969d90ad5ebe	6f058ee5-5d73-4f6d-b8a1-39fb0dc2bd15	bd2bcbf1-a9e3-43ff-a87c-3085fc548994	efaa5763-1c8e-4d18-8c78-db28111e1922	20096bd9-637a-42c5-a5ae-7c5f60ef9a1a	\N	\N	5	7	4	6	\N	\N	GROUP	5	df4f9969-d564-4da2-8c00-842baafa5337	20096bd9-637a-42c5-a5ae-7c5f60ef9a1a
cfd43561-38e3-45ec-9676-dfc4fdb3e6c4	9ef639ca-1166-4d47-af85-65d837683400	bd2bcbf1-a9e3-43ff-a87c-3085fc548994	9941acfd-d9b4-425b-bf6b-67aa976837a0	20096bd9-637a-42c5-a5ae-7c5f60ef9a1a	\N	\N	6	2	6	2	\N	\N	GROUP	3	df4f9969-d564-4da2-8c00-842baafa5337	9941acfd-d9b4-425b-bf6b-67aa976837a0
2d228be8-bc4c-45f2-9edc-b15b39085bbe	326c3e5f-b80c-4102-9a57-05b268026a62	282bff31-e00c-4f0f-9a52-2f5cf3968d3d	559f1fd3-54fe-4b7a-aba3-f6d2ea660f1d	b06c5cfd-b49c-4c19-987d-40af61b1948b	\N	\N	2	6	5	7	\N	\N	GROUP	2	df4f9969-d564-4da2-8c00-842baafa5337	b06c5cfd-b49c-4c19-987d-40af61b1948b
7edfc721-7da8-4617-9c5f-8e6125a34e36	326c3e5f-b80c-4102-9a57-05b268026a62	\N	8653f730-9196-42f5-92c7-bfab95136017	b06c5cfd-b49c-4c19-987d-40af61b1948b	0	4	0	6	7	5	6	1	BRACKET	0	df4f9969-d564-4da2-8c00-842baafa5337	8653f730-9196-42f5-92c7-bfab95136017
f8a1ef2d-0920-4be3-8506-524921f26ce2	6f058ee5-5d73-4f6d-b8a1-39fb0dc2bd15	\N	c91f0dcc-9b9f-49b2-8536-d68e567711cb	20096bd9-637a-42c5-a5ae-7c5f60ef9a1a	1	4	3	6	6	7	\N	\N	BRACKET	0	df4f9969-d564-4da2-8c00-842baafa5337	20096bd9-637a-42c5-a5ae-7c5f60ef9a1a
c96c85ac-cecd-4677-8505-377bc459f2e0	9ef639ca-1166-4d47-af85-65d837683400	\N	559f1fd3-54fe-4b7a-aba3-f6d2ea660f1d	2aff7d64-c692-4e6b-b52a-e3a39ffeddfd	2	4	4	6	6	3	6	4	BRACKET	0	df4f9969-d564-4da2-8c00-842baafa5337	559f1fd3-54fe-4b7a-aba3-f6d2ea660f1d
28153fb2-9792-41d3-9b5f-dd4fb21d6fcd	bcd4378d-4c64-4c27-880a-7f61ef95e9ad	\N	9941acfd-d9b4-425b-bf6b-67aa976837a0	88d16918-2962-4ab1-84b5-91d8f307be2e	3	4	6	2	0	6	6	7	BRACKET	0	df4f9969-d564-4da2-8c00-842baafa5337	88d16918-2962-4ab1-84b5-91d8f307be2e
8b3ae5a6-d5ae-46a1-92ff-c0e7575917a4	326c3e5f-b80c-4102-9a57-05b268026a62	\N	8653f730-9196-42f5-92c7-bfab95136017	20096bd9-637a-42c5-a5ae-7c5f60ef9a1a	0	2	6	7	6	0	6	2	BRACKET	1	df4f9969-d564-4da2-8c00-842baafa5337	8653f730-9196-42f5-92c7-bfab95136017
279b347c-1863-40a5-8d05-9cb9d1e2ccf1	6f058ee5-5d73-4f6d-b8a1-39fb0dc2bd15	\N	559f1fd3-54fe-4b7a-aba3-f6d2ea660f1d	88d16918-2962-4ab1-84b5-91d8f307be2e	1	2	5	7	6	2	5	7	BRACKET	1	df4f9969-d564-4da2-8c00-842baafa5337	88d16918-2962-4ab1-84b5-91d8f307be2e
272bd5b3-d9bd-46c0-8cb2-8bd8fa0773cb	326c3e5f-b80c-4102-9a57-05b268026a62	\N	8653f730-9196-42f5-92c7-bfab95136017	88d16918-2962-4ab1-84b5-91d8f307be2e	0	1	6	7	5	7	\N	\N	BRACKET	2	df4f9969-d564-4da2-8c00-842baafa5337	88d16918-2962-4ab1-84b5-91d8f307be2e
63f55fb5-0320-4216-b373-87d2d64f5470	9ef639ca-1166-4d47-af85-65d837683400	a6cf0c89-a4d3-40fe-b645-adea85036b11	e19be0fa-193d-4184-82dd-9cd5c063f546	c91f0dcc-9b9f-49b2-8536-d68e567711cb	\N	\N	5	7	6	4	5	7	GROUP	7	df4f9969-d564-4da2-8c00-842baafa5337	c91f0dcc-9b9f-49b2-8536-d68e567711cb
31abb446-2c68-4cc0-96bc-fb249ed62296	6f058ee5-5d73-4f6d-b8a1-39fb0dc2bd15	a6cf0c89-a4d3-40fe-b645-adea85036b11	a5c8c6fc-036f-40f0-acfc-1713593705a5	c91f0dcc-9b9f-49b2-8536-d68e567711cb	\N	\N	3	6	3	6	\N	\N	GROUP	0	df4f9969-d564-4da2-8c00-842baafa5337	c91f0dcc-9b9f-49b2-8536-d68e567711cb
82a655c9-c15f-473b-9190-0a4aaa611d1d	bcd4378d-4c64-4c27-880a-7f61ef95e9ad	a6cf0c89-a4d3-40fe-b645-adea85036b11	88d16918-2962-4ab1-84b5-91d8f307be2e	c91f0dcc-9b9f-49b2-8536-d68e567711cb	\N	\N	6	2	2	6	6	7	GROUP	3	df4f9969-d564-4da2-8c00-842baafa5337	c91f0dcc-9b9f-49b2-8536-d68e567711cb
2a601e15-12d1-49b0-aabc-1861afc12d24	9ef639ca-1166-4d47-af85-65d837683400	a6cf0c89-a4d3-40fe-b645-adea85036b11	a5c8c6fc-036f-40f0-acfc-1713593705a5	e19be0fa-193d-4184-82dd-9cd5c063f546	\N	\N	6	4	7	5	\N	\N	GROUP	4	df4f9969-d564-4da2-8c00-842baafa5337	a5c8c6fc-036f-40f0-acfc-1713593705a5
4bd2df0b-0e77-44f8-a8f5-66e0e84c737c	6f058ee5-5d73-4f6d-b8a1-39fb0dc2bd15	282bff31-e00c-4f0f-9a52-2f5cf3968d3d	b06c5cfd-b49c-4c19-987d-40af61b1948b	52aa1ba4-1ab4-4d31-9fab-891c97f9f369	\N	\N	0	6	2	6	\N	\N	GROUP	3	df4f9969-d564-4da2-8c00-842baafa5337	52aa1ba4-1ab4-4d31-9fab-891c97f9f369
74d1d29f-14b8-44bf-a775-9ce33808d296	326c3e5f-b80c-4102-9a57-05b268026a62	282bff31-e00c-4f0f-9a52-2f5cf3968d3d	559f1fd3-54fe-4b7a-aba3-f6d2ea660f1d	52aa1ba4-1ab4-4d31-9fab-891c97f9f369	\N	\N	6	0	6	4	\N	\N	GROUP	5	df4f9969-d564-4da2-8c00-842baafa5337	559f1fd3-54fe-4b7a-aba3-f6d2ea660f1d
59401525-166a-4e86-958e-b7e5d62e0020	6f058ee5-5d73-4f6d-b8a1-39fb0dc2bd15	bd2bcbf1-a9e3-43ff-a87c-3085fc548994	9941acfd-d9b4-425b-bf6b-67aa976837a0	efaa5763-1c8e-4d18-8c78-db28111e1922	\N	\N	7	5	6	7	6	4	GROUP	2	df4f9969-d564-4da2-8c00-842baafa5337	9941acfd-d9b4-425b-bf6b-67aa976837a0
e39976fb-d9fb-4b08-bb50-b1e1456993e8	6f058ee5-5d73-4f6d-b8a1-39fb0dc2bd15	282bff31-e00c-4f0f-9a52-2f5cf3968d3d	52aa1ba4-1ab4-4d31-9fab-891c97f9f369	a2606449-3ce7-414a-a84e-774a0da80bfc	\N	\N	6	2	2	6	6	3	GROUP	1	df4f9969-d564-4da2-8c00-842baafa5337	52aa1ba4-1ab4-4d31-9fab-891c97f9f369
b5cb6f13-8282-4657-944d-50f90a03c1de	6f058ee5-5d73-4f6d-b8a1-39fb0dc2bd15	282bff31-e00c-4f0f-9a52-2f5cf3968d3d	b06c5cfd-b49c-4c19-987d-40af61b1948b	a2606449-3ce7-414a-a84e-774a0da80bfc	\N	\N	6	4	7	5	\N	\N	GROUP	7	df4f9969-d564-4da2-8c00-842baafa5337	b06c5cfd-b49c-4c19-987d-40af61b1948b
a7e8f533-78e3-41bd-be55-db14485afa79	326c3e5f-b80c-4102-9a57-05b268026a62	282bff31-e00c-4f0f-9a52-2f5cf3968d3d	559f1fd3-54fe-4b7a-aba3-f6d2ea660f1d	a2606449-3ce7-414a-a84e-774a0da80bfc	\N	\N	6	4	7	6	\N	\N	GROUP	3	df4f9969-d564-4da2-8c00-842baafa5337	559f1fd3-54fe-4b7a-aba3-f6d2ea660f1d
\.


--
-- Data for Name: organizers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organizers (id, email, password_hash, name) FROM stdin;
7c6ec6b5-b74c-4766-adfd-5dfd898b4a34	jmeter@prueba.local	CfDARXxy9bxyYQ+q0MoiCMX+BXpwPlbO0AdbAlOhiaI=	Organizador JMeter
32baf9ae-7a3b-4336-8d57-1e7329ff9b5a	demo@padelsync.local	5NMYd74rmbKdFhh34J7SZ4AjpGwNLvd+6zE1ApjF7Q8=	Organizador Demo
\.


--
-- Data for Name: pair_available_schedules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pair_available_schedules (pair_id, schedule) FROM stdin;
88d16918-2962-4ab1-84b5-91d8f307be2e	H09_12
88d16918-2962-4ab1-84b5-91d8f307be2e	H12_15
88d16918-2962-4ab1-84b5-91d8f307be2e	H15_18
559f1fd3-54fe-4b7a-aba3-f6d2ea660f1d	H12_15
559f1fd3-54fe-4b7a-aba3-f6d2ea660f1d	H15_18
b461659e-e187-4932-bbf0-9eadb8d0ed09	H09_12
b461659e-e187-4932-bbf0-9eadb8d0ed09	H15_18
b461659e-e187-4932-bbf0-9eadb8d0ed09	H18_21
9941acfd-d9b4-425b-bf6b-67aa976837a0	H09_12
9941acfd-d9b4-425b-bf6b-67aa976837a0	H12_15
ae9226af-1e43-45ce-b278-020116eb6f4b	H15_18
ae9226af-1e43-45ce-b278-020116eb6f4b	H18_21
8653f730-9196-42f5-92c7-bfab95136017	H09_12
8653f730-9196-42f5-92c7-bfab95136017	H12_15
8653f730-9196-42f5-92c7-bfab95136017	H18_21
20096bd9-637a-42c5-a5ae-7c5f60ef9a1a	H12_15
20096bd9-637a-42c5-a5ae-7c5f60ef9a1a	H15_18
20096bd9-637a-42c5-a5ae-7c5f60ef9a1a	H18_21
a5c8c6fc-036f-40f0-acfc-1713593705a5	H09_12
a5c8c6fc-036f-40f0-acfc-1713593705a5	H15_18
b06c5cfd-b49c-4c19-987d-40af61b1948b	H12_15
b06c5cfd-b49c-4c19-987d-40af61b1948b	H18_21
c91f0dcc-9b9f-49b2-8536-d68e567711cb	H09_12
c91f0dcc-9b9f-49b2-8536-d68e567711cb	H12_15
c91f0dcc-9b9f-49b2-8536-d68e567711cb	H15_18
c91f0dcc-9b9f-49b2-8536-d68e567711cb	H18_21
e19be0fa-193d-4184-82dd-9cd5c063f546	H15_18
e19be0fa-193d-4184-82dd-9cd5c063f546	H18_21
52aa1ba4-1ab4-4d31-9fab-891c97f9f369	H09_12
52aa1ba4-1ab4-4d31-9fab-891c97f9f369	H12_15
52aa1ba4-1ab4-4d31-9fab-891c97f9f369	H15_18
efaa5763-1c8e-4d18-8c78-db28111e1922	H12_15
efaa5763-1c8e-4d18-8c78-db28111e1922	H15_18
2aff7d64-c692-4e6b-b52a-e3a39ffeddfd	H09_12
2aff7d64-c692-4e6b-b52a-e3a39ffeddfd	H18_21
a2606449-3ce7-414a-a84e-774a0da80bfc	H09_12
a2606449-3ce7-414a-a84e-774a0da80bfc	H12_15
a2606449-3ce7-414a-a84e-774a0da80bfc	H18_21
c222618c-bcbd-46bc-870b-c422b9f27165	H15_18
c222618c-bcbd-46bc-870b-c422b9f27165	H09_12
c222618c-bcbd-46bc-870b-c422b9f27165	H12_15
\.


--
-- Data for Name: pairs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pairs (id, category, level, schedule, player1_id, player2_id, tournament_id, group_id) FROM stdin;
c222618c-bcbd-46bc-870b-c422b9f27165	A1	MEDIO	\N	a3c8839f-faae-4cf9-9b5c-cc8fd31b85ea	3020ea69-40e9-46f1-b2d4-2d586f1b6fd8	df4f9969-d564-4da2-8c00-842baafa5337	bd2bcbf1-a9e3-43ff-a87c-3085fc548994
88d16918-2962-4ab1-84b5-91d8f307be2e	A1	ALTO	\N	58471dba-7e58-41ae-a437-d9d85307b3e9	d755a2ab-93e1-4a93-af61-438c46e7ac11	df4f9969-d564-4da2-8c00-842baafa5337	a6cf0c89-a4d3-40fe-b645-adea85036b11
559f1fd3-54fe-4b7a-aba3-f6d2ea660f1d	A1	ALTO	\N	9eb6d9f6-9088-4ef1-84fe-1fb7f4285e1b	cac45685-d93c-47a4-b778-fd80cf51fc84	df4f9969-d564-4da2-8c00-842baafa5337	282bff31-e00c-4f0f-9a52-2f5cf3968d3d
b461659e-e187-4932-bbf0-9eadb8d0ed09	A1	ALTO	\N	67b21cd3-b5c3-4f63-8080-14e2533be6d4	6cf0ec80-55ac-4bbb-bb95-38df0c98bfea	df4f9969-d564-4da2-8c00-842baafa5337	908925e0-262a-446e-9c1e-f24d79f02a3d
9941acfd-d9b4-425b-bf6b-67aa976837a0	A1	ALTO	\N	ec931de8-ba78-4bf4-89ed-8f98134d9fdc	de75a8ed-eefb-42c4-b0f9-b2c2f0548861	df4f9969-d564-4da2-8c00-842baafa5337	bd2bcbf1-a9e3-43ff-a87c-3085fc548994
ae9226af-1e43-45ce-b278-020116eb6f4b	A1	MEDIO	\N	30cecb4e-f271-464c-b8cd-69f20ff43138	eb3af3c2-0b54-494e-9e64-e3038a4bd802	df4f9969-d564-4da2-8c00-842baafa5337	908925e0-262a-446e-9c1e-f24d79f02a3d
8653f730-9196-42f5-92c7-bfab95136017	A1	MEDIO	\N	6fb129a9-b91f-4db3-b023-8152517be21e	e89d9a01-17f6-42cf-af7d-c11f457ba9f9	df4f9969-d564-4da2-8c00-842baafa5337	908925e0-262a-446e-9c1e-f24d79f02a3d
20096bd9-637a-42c5-a5ae-7c5f60ef9a1a	A1	MEDIO	\N	0243ccb0-ba42-4142-b424-29cb07617b22	04c7188b-f8a2-4933-b9c1-2cc207d69081	df4f9969-d564-4da2-8c00-842baafa5337	bd2bcbf1-a9e3-43ff-a87c-3085fc548994
a5c8c6fc-036f-40f0-acfc-1713593705a5	A1	MEDIO	\N	b148aa97-b18a-4e51-a115-753511f4001d	b14c70d1-1894-4421-8a49-fd832bb1cc6b	df4f9969-d564-4da2-8c00-842baafa5337	a6cf0c89-a4d3-40fe-b645-adea85036b11
b06c5cfd-b49c-4c19-987d-40af61b1948b	A1	MEDIO	\N	ca6d501b-cbd8-4fa6-907e-2a2c195f2227	3a1b18f4-03ed-4131-b2fe-fa806deda82a	df4f9969-d564-4da2-8c00-842baafa5337	282bff31-e00c-4f0f-9a52-2f5cf3968d3d
c91f0dcc-9b9f-49b2-8536-d68e567711cb	A1	MEDIO	\N	e876e5c6-dbfd-40ab-92d3-3cc2a651371a	452b6c94-fa37-4316-a9fe-778859cc5221	df4f9969-d564-4da2-8c00-842baafa5337	a6cf0c89-a4d3-40fe-b645-adea85036b11
e19be0fa-193d-4184-82dd-9cd5c063f546	A1	BAJO	\N	6d8db241-b535-48bf-98e6-d29aac38c629	a0b8daff-ef91-49bb-a0e9-debad16f325f	df4f9969-d564-4da2-8c00-842baafa5337	a6cf0c89-a4d3-40fe-b645-adea85036b11
52aa1ba4-1ab4-4d31-9fab-891c97f9f369	A1	BAJO	\N	1186e1a0-552c-4d98-bd1a-64c1dc4a890d	bac9415a-10a1-4c87-b178-4d0075f30f54	df4f9969-d564-4da2-8c00-842baafa5337	282bff31-e00c-4f0f-9a52-2f5cf3968d3d
efaa5763-1c8e-4d18-8c78-db28111e1922	A1	BAJO	\N	2ae9eaea-9cd0-48db-8cdb-868081013f93	471eb56e-a80c-4e24-ad68-74b5c25edede	df4f9969-d564-4da2-8c00-842baafa5337	bd2bcbf1-a9e3-43ff-a87c-3085fc548994
2aff7d64-c692-4e6b-b52a-e3a39ffeddfd	A1	BAJO	\N	1aadaf11-bc60-4d9c-a29c-4941e0f51848	f8a4640a-99e7-4358-9c45-f1165eba23ca	df4f9969-d564-4da2-8c00-842baafa5337	908925e0-262a-446e-9c1e-f24d79f02a3d
a2606449-3ce7-414a-a84e-774a0da80bfc	A1	BAJO	\N	d2a4f0ed-4f7c-4173-94fd-0ccaefd033f4	c9bfa04e-886e-4eb6-aa18-2251c999ab51	df4f9969-d564-4da2-8c00-842baafa5337	282bff31-e00c-4f0f-9a52-2f5cf3968d3d
\.


--
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.players (id, name, last_name, email, phone, category) FROM stdin;
11ea3487-1f04-40d7-b66d-a441193fdb71	Martín	Gómez	martin.gomez@example.com	\N	A6
103da91f-13ac-4dd6-a4f5-f65ee773fd2d	Lucas	Fernández	lucas.fernandez@example.com	\N	A7
a48dc8a3-13da-4ecd-be5e-3bc92779a6b2	Santiago	Rodríguez	santiago.rodriguez@example.com	\N	A6
e07546f3-04d3-4527-9834-d9ff36472c72	Nicolás	López	nicolas.lopez@example.com	\N	A6
bb33b3c2-10c2-40a9-b814-ff18f7a9a1c7	Federico	Martínez	federico.martinez@example.com	\N	A7
8029cd8a-1f28-44d0-96d9-49ccc49e3513	Agustín	Pérez	agustin.perez@example.com	\N	A6
c758c7e6-fbff-4376-873b-b6b8340e9c0c	Joaquín	García	joaquin.garcia@example.com	\N	A6
2c9b0fcc-c9e2-4709-900c-e232e7e1a8af	Tomás	Sánchez	tomas.sanchez@example.com	\N	A7
58471dba-7e58-41ae-a437-d9d85307b3e9	Agustín	Tapia	agustin.tapia@example.com	\N	A1
9eb6d9f6-9088-4ef1-84fe-1fb7f4285e1b	Federico	Chingotto	federico.chingotto@example.com	\N	A1
67b21cd3-b5c3-4f63-8080-14e2533be6d4	Juan	Lebrón	juan.lebron@example.com	\N	A1
ec931de8-ba78-4bf4-89ed-8f98134d9fdc	Alejandro	Galán	alejandro.galan@example.com	\N	A1
30cecb4e-f271-464c-b8cd-69f20ff43138	Leandro	Augsburger	leandro.augsburger@example.com	\N	A1
6fb129a9-b91f-4db3-b023-8152517be21e	Sebastián	Nerone	sebastian.nerone@example.com	\N	A2
0243ccb0-ba42-4142-b424-29cb07617b22	Lucas	Bergamini	lucas.bergamini@example.com	\N	A1
b148aa97-b18a-4e51-a115-753511f4001d	Tino	Libaak	tino.libaak@example.com	\N	A2
ca6d501b-cbd8-4fa6-907e-2a2c195f2227	Gonzalo	Alfonso	gonzalo.alfonso@example.com	\N	A1
e876e5c6-dbfd-40ab-92d3-3cc2a651371a	Matías	Díaz	matias.diaz@example.com	\N	A1
6d8db241-b535-48bf-98e6-d29aac38c629	Pablo	Lima	pablo.lima@example.com	\N	A2
1186e1a0-552c-4d98-bd1a-64c1dc4a890d	Agustín	Gutiérrez	agustin.gutierrez@example.com	\N	A2
2ae9eaea-9cd0-48db-8cdb-868081013f93	Lucas	Campagnolo	lucas.campagnolo@example.com	\N	A1
1aadaf11-bc60-4d9c-a29c-4941e0f51848	Nicolás	Rodríguez	nicolas.rodriguez@example.com	\N	A2
d2a4f0ed-4f7c-4173-94fd-0ccaefd033f4	Joaquín	Pereyra	joaquin.pereyra@example.com	\N	A2
d755a2ab-93e1-4a93-af61-438c46e7ac11	Arturo	Coello	arturo.coello@example.com	\N	A1
cac45685-d93c-47a4-b778-fd80cf51fc84	Martín	Di Nenno	martin.dinenno@example.com	\N	A1
6cf0ec80-55ac-4bbb-bb95-38df0c98bfea	Franco	Stupaczuk	franco.stupaczuk@example.com	\N	A1
de75a8ed-eefb-42c4-b0f9-b2c2f0548861	Momo	González	momo.gonzalez@example.com	\N	A2
eb3af3c2-0b54-494e-9e64-e3038a4bd802	Juan Martín	Díaz	juan martin.diaz@example.com	\N	A1
e89d9a01-17f6-42cf-af7d-c11f457ba9f9	Maximiliano	Sánchez	maximiliano.sanchez@example.com	\N	A1
04c7188b-f8a2-4933-b9c1-2cc207d69081	Jerónimo	González	jeronimo.gonzalez@example.com	\N	A2
b14c70d1-1894-4421-8a49-fd832bb1cc6b	Facundo	Domínguez	facundo.dominguez@example.com	\N	A1
3a1b18f4-03ed-4131-b2fe-fa806deda82a	Javier	Garrido	javier.garrido@example.com	\N	A2
452b6c94-fa37-4316-a9fe-778859cc5221	Ignacio	Vilariño	ignacio.vilarino@example.com	\N	A2
a0b8daff-ef91-49bb-a0e9-debad16f325f	Francisco	Gil	francisco.gil@example.com	\N	A2
bac9415a-10a1-4c87-b178-4d0075f30f54	Tomás	Belluati	tomas.belluati@example.com	\N	A2
471eb56e-a80c-4e24-ad68-74b5c25edede	Bautista	Bustos	bautista.bustos@example.com	\N	A2
f8a4640a-99e7-4358-9c45-f1165eba23ca	Santiago	Ruiz	santiago.ruiz@example.com	\N	A2
c9bfa04e-886e-4eb6-aa18-2251c999ab51	Emiliano	Ferreyra	emiliano.ferreyra@example.com	\N	A1
80ca9e7d-6fe0-42fd-b493-e0f6b2fcae85	Fernando	Belasteguín	fernando.belasteguin@example.com	\N	A1
d7efead7-0ec7-4687-a6d0-650d1f96b70b	Paquito	Navarro	paquito.navarro@example.com	\N	A1
7a420b87-f36c-4bfc-b0b0-87d6f23ccb70	Sanyo	Gutiérrez	\N	\N	A1
c91f71d3-63b4-4c12-9eb0-1985ac0e40f4	Juan	Tello	juan.tello@example.com	\N	A1
945552f8-9287-4674-8816-cade6f4b0794	Miguel	Lamperti	\N	\N	A2
ee2960f2-8125-4951-8255-e909a600b9a1	Pablo	Lijó	pablo.lijo@example.com	\N	A2
5b447ea3-c878-4067-bd51-6556251fdd2d	Mike	Yanguas	mike.yanguas@example.com	\N	A2
d7d33189-a2cf-4364-885a-a2c4dbb30e93	Coki	Nieto	\N	\N	A2
8c6c5161-7be7-4503-820e-e4c6e7734716	Javier	Leal	javier.leal@example.com	\N	A3
12cc7cc3-a4b2-4d54-a078-f4eed536069e	Edu	Alonso	edu.alonso@example.com	\N	A3
b4c1a172-5c40-4942-904d-c24f526c8d85	Alejandro	Ruiz	\N	\N	A3
4460ee5f-bd9d-4922-87cc-5017010678e1	Juan Cruz	Belluati	juancruz.belluati@example.com	\N	A3
e3e15984-ee39-4130-b6d2-17faf627f57a	Maximiliano	Arce	maximiliano.arce@example.com	\N	A4
b00d91c0-6591-4e10-81fb-c1e677888bdd	Rodrigo	Ovide	\N	\N	A4
a6e8aa7e-d4f4-4999-a552-df6c46b40964	Ramiro	Moyano	ramiro.moyano@example.com	\N	A4
5e33883b-8481-489e-b796-100bb87b88a9	Hernán	Auguste	hernan.auguste@example.com	\N	A4
a8aa351d-7a0e-40ec-9090-dd7b13b0e1aa	Gemma	Triay	gemma.triay@example.com	\N	A5
fc9351fe-bce3-4b54-b6fe-96dcc5be4612	Delfina	Brea	\N	\N	A5
444d1719-48ec-4d4d-ad00-a03f5ee9f6c1	Ariana	Sánchez	ariana.sanchez@example.com	\N	A5
6cee3c8e-5b17-4c5c-bc27-74aad5db3527	Paula	Josemaría	paula.josemaria@example.com	\N	A5
95fdb5f4-d920-42f8-ad7d-e88f27005a85	Bea	González	\N	\N	A6
fee25b8b-f0f9-40fd-bd68-a2609fc195a3	Marta	Ortega	marta.ortega@example.com	\N	A6
1c901657-d2ae-476e-8f7e-0e1edfbc7216	Claudia	Fernández	claudia.fernandez@example.com	\N	A6
87431686-7f38-43f7-b4c3-0166d43b31a3	Tamara	Icardo	\N	\N	A6
b19f07ea-fc53-4148-b65d-179991b2b3b1	Alejandra	Salazar	alejandra.salazar@example.com	\N	A7
5d988b94-84be-4a14-8904-41c02b1a0d1f	Virginia	Riera	virginia.riera@example.com	\N	A7
0a3636c7-c555-4cc7-8d7a-eb15226984c2	Sofía	Araújo	\N	\N	A7
3d9b3801-86dd-4990-bc36-60758c670583	Aranzazu	Osoro	aranzazu.osoro@example.com	\N	A7
f2716e40-f49b-40e8-a671-693f6356ab02	Martina	Calvo	martina.calvo@example.com	\N	A8
3f00a2fb-82da-46fd-8c97-42ffdb302e7d	Lucía	Sainz	\N	\N	A8
a3c8839f-faae-4cf9-9b5c-cc8fd31b85ea	Francisco	Chacoma	francisco.chacoma@example.com	\N	A1
3020ea69-40e9-46f1-b2d4-2d586f1b6fd8	Maximiliano	Reyna	maximiliano.reyna@example.com	\N	A1
\.


--
-- Data for Name: tournament_groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tournament_groups (id, category, name, tournament_id) FROM stdin;
908925e0-262a-446e-9c1e-f24d79f02a3d	A1	A	df4f9969-d564-4da2-8c00-842baafa5337
282bff31-e00c-4f0f-9a52-2f5cf3968d3d	A1	B	df4f9969-d564-4da2-8c00-842baafa5337
bd2bcbf1-a9e3-43ff-a87c-3085fc548994	A1	C	df4f9969-d564-4da2-8c00-842baafa5337
a6cf0c89-a4d3-40fe-b645-adea85036b11	A1	D	df4f9969-d564-4da2-8c00-842baafa5337
\.


--
-- Data for Name: tournament_venues; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tournament_venues (tournament_id, venue_id) FROM stdin;
df4f9969-d564-4da2-8c00-842baafa5337	5d6e2c26-6b35-4d10-ad0b-8694917c5cfe
\.


--
-- Data for Name: tournaments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tournaments (id, name, type, organizer_id, category, start_date) FROM stdin;
df4f9969-d564-4da2-8c00-842baafa5337	Torneo noviembre 2026	ESTANDAR	32baf9ae-7a3b-4336-8d57-1e7329ff9b5a	A1	2026-11-14
\.


--
-- Data for Name: venues; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.venues (id, address, name, organizer_id) FROM stdin;
5d6e2c26-6b35-4d10-ad0b-8694917c5cfe	\N	Zone	32baf9ae-7a3b-4336-8d57-1e7329ff9b5a
\.


--
-- Name: courts courts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courts
    ADD CONSTRAINT courts_pkey PRIMARY KEY (id);


--
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_pkey PRIMARY KEY (id);


--
-- Name: organizers organizers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizers
    ADD CONSTRAINT organizers_pkey PRIMARY KEY (id);


--
-- Name: pairs pairs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pairs
    ADD CONSTRAINT pairs_pkey PRIMARY KEY (id);


--
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- Name: tournament_groups tournament_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tournament_groups
    ADD CONSTRAINT tournament_groups_pkey PRIMARY KEY (id);


--
-- Name: tournament_venues tournament_venues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tournament_venues
    ADD CONSTRAINT tournament_venues_pkey PRIMARY KEY (tournament_id, venue_id);


--
-- Name: tournaments tournaments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tournaments
    ADD CONSTRAINT tournaments_pkey PRIMARY KEY (id);


--
-- Name: organizers uk3507nf5g1ylv098m0dkd2cruk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizers
    ADD CONSTRAINT uk3507nf5g1ylv098m0dkd2cruk UNIQUE (email);


--
-- Name: venues venues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venues
    ADD CONSTRAINT venues_pkey PRIMARY KEY (id);


--
-- Name: pairs fk4lgj26hnd8raehi4x7mc4qj2j; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pairs
    ADD CONSTRAINT fk4lgj26hnd8raehi4x7mc4qj2j FOREIGN KEY (tournament_id) REFERENCES public.tournaments(id);


--
-- Name: venues fk5negy4v8ln3lyxl5gwjyb8prn; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.venues
    ADD CONSTRAINT fk5negy4v8ln3lyxl5gwjyb8prn FOREIGN KEY (organizer_id) REFERENCES public.organizers(id);


--
-- Name: tournament_groups fk69cxdijppe91a9f11li2pbq4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tournament_groups
    ADD CONSTRAINT fk69cxdijppe91a9f11li2pbq4 FOREIGN KEY (tournament_id) REFERENCES public.tournaments(id);


--
-- Name: matches fk6et2welm24skyoqi9ivros056; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT fk6et2welm24skyoqi9ivros056 FOREIGN KEY (pair2_id) REFERENCES public.pairs(id);


--
-- Name: matches fk9at6y4yc6k2kbtmqxkkh9xi0u; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT fk9at6y4yc6k2kbtmqxkkh9xi0u FOREIGN KEY (court_id) REFERENCES public.courts(id);


--
-- Name: tournaments fk9lhophem2qvr91kxt2a6vui1m; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tournaments
    ADD CONSTRAINT fk9lhophem2qvr91kxt2a6vui1m FOREIGN KEY (organizer_id) REFERENCES public.organizers(id);


--
-- Name: pair_available_schedules fk9wqhj3lk52mocjlsoy21vqqnt; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pair_available_schedules
    ADD CONSTRAINT fk9wqhj3lk52mocjlsoy21vqqnt FOREIGN KEY (pair_id) REFERENCES public.pairs(id);


--
-- Name: matches fkb8pcikcjdcxnd828so8xhmhyg; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT fkb8pcikcjdcxnd828so8xhmhyg FOREIGN KEY (winner_id) REFERENCES public.pairs(id);


--
-- Name: courts fkc588eogjvkwv2gfs9ulycwbk1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courts
    ADD CONSTRAINT fkc588eogjvkwv2gfs9ulycwbk1 FOREIGN KEY (venue_id) REFERENCES public.venues(id);


--
-- Name: pairs fkcd2lso7yief4a04yhtlf4p6x1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pairs
    ADD CONSTRAINT fkcd2lso7yief4a04yhtlf4p6x1 FOREIGN KEY (player2_id) REFERENCES public.players(id);


--
-- Name: matches fkeeniokyjgo5k6rmhjujatn27i; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT fkeeniokyjgo5k6rmhjujatn27i FOREIGN KEY (tournament_id) REFERENCES public.tournaments(id);


--
-- Name: tournament_venues fkhs02jaofu7grhbw96vdd2d375; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tournament_venues
    ADD CONSTRAINT fkhs02jaofu7grhbw96vdd2d375 FOREIGN KEY (venue_id) REFERENCES public.venues(id);


--
-- Name: pairs fki4t6ouvg1dr0yw4khe8kqi0qe; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pairs
    ADD CONSTRAINT fki4t6ouvg1dr0yw4khe8kqi0qe FOREIGN KEY (group_id) REFERENCES public.tournament_groups(id);


--
-- Name: matches fkjefa4a6lw7amwftv2ae3g65lt; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT fkjefa4a6lw7amwftv2ae3g65lt FOREIGN KEY (pair1_id) REFERENCES public.pairs(id);


--
-- Name: tournament_venues fkl03ewyuh3x52279quw4y7uga2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tournament_venues
    ADD CONSTRAINT fkl03ewyuh3x52279quw4y7uga2 FOREIGN KEY (tournament_id) REFERENCES public.tournaments(id);


--
-- Name: matches fkmsm4kpptyns423sajyvkj7oy2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT fkmsm4kpptyns423sajyvkj7oy2 FOREIGN KEY (group_id) REFERENCES public.tournament_groups(id);


--
-- Name: pairs fknnqa098q1rtohjgoaohb94ik2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pairs
    ADD CONSTRAINT fknnqa098q1rtohjgoaohb94ik2 FOREIGN KEY (player1_id) REFERENCES public.players(id);


--
-- PostgreSQL database dump complete
--

\unrestrict sxNldLaHYu6KfV8f4uYmZFd6bY16bdDxYtM7wTaOG4SsXi587KvIjDJys3bPC1Q

