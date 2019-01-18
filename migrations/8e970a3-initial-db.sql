--
-- PostgreSQL database dump
--

-- Dumped from sequelize generated tables on 20190118 from commit 8e970a3
-- All migrations are based on this base

-- Dumped from database version 10.6 (Ubuntu 10.6-0ubuntu0.18.04.1)
-- Dumped by pg_dump version 10.6 (Ubuntu 10.6-0ubuntu0.18.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Account" (
    id integer NOT NULL,
    "isVerified" text,
    name json,
    company text,
    phone text,
    zip text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "UserId" integer
);


--
-- Name: Account_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Account_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Account_id_seq" OWNED BY public."Account".id;


--
-- Name: Admin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Admin" (
    id integer NOT NULL,
    name json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "UserId" integer,
    "AdminGroupId" integer
);


--
-- Name: AdminGroup; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AdminGroup" (
    id integer NOT NULL,
    name text,
    permissions json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: AdminGroup_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."AdminGroup_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: AdminGroup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."AdminGroup_id_seq" OWNED BY public."AdminGroup".id;


--
-- Name: Admin_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Admin_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Admin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Admin_id_seq" OWNED BY public."Admin".id;


--
-- Name: Category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Category" (
    id integer NOT NULL,
    name text,
    pivot text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: Category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Category_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Category_id_seq" OWNED BY public."Category".id;


--
-- Name: LoginAttempt; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LoginAttempt" (
    id integer NOT NULL,
    ip text,
    "user" text,
    "time" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: LoginAttempt_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."LoginAttempt_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: LoginAttempt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."LoginAttempt_id_seq" OWNED BY public."LoginAttempt".id;


--
-- Name: Message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Message" (
    id integer NOT NULL,
    name text,
    body text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "UserId" integer
);


--
-- Name: Message_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Message_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Message_id_seq" OWNED BY public."Message".id;


--
-- Name: Note; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Note" (
    id integer NOT NULL,
    data text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: Note_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Note_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Note_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Note_id_seq" OWNED BY public."Note".id;


--
-- Name: RequestDuplicates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RequestDuplicates" (
    id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "requestId" integer
);


--
-- Name: RequestDuplicates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."RequestDuplicates_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: RequestDuplicates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."RequestDuplicates_id_seq" OWNED BY public."RequestDuplicates".id;


--
-- Name: Requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Requests" (
    id integer NOT NULL,
    name text,
    address text,
    sms_raw_address text,
    assigned_rc_region text,
    city text,
    state text,
    zip text,
    sms_raw_zip text,
    phone text,
    sms_raw_phone text,
    email text,
    source text,
    serial text,
    status text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    selected_county integer
);


--
-- Name: Requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Requests_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Requests_id_seq" OWNED BY public."Requests".id;


--
-- Name: SelectedCounties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SelectedCounties" (
    id integer NOT NULL,
    region text,
    state text,
    county text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: SelectedCounties_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."SelectedCounties_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: SelectedCounties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."SelectedCounties_id_seq" OWNED BY public."SelectedCounties".id;


--
-- Name: Status; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Status" (
    id integer NOT NULL,
    name text,
    pivot text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: StatusLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StatusLog" (
    id integer NOT NULL,
    name text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: StatusLog_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."StatusLog_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: StatusLog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."StatusLog_id_seq" OWNED BY public."StatusLog".id;


--
-- Name: Status_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Status_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Status_id_seq" OWNED BY public."Status".id;


--
-- Name: UsAddress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UsAddress" (
    id integer NOT NULL,
    zip text,
    type text,
    primary_city text,
    acceptable_cities text,
    unacceptable_cities text,
    state text,
    county text,
    timezone text,
    area_codes text,
    latitude numeric,
    longitude numeric,
    world_region text,
    country text,
    decommissioned boolean,
    estimated_population integer,
    notes text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: UsAddress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."UsAddress_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: UsAddress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."UsAddress_id_seq" OWNED BY public."UsAddress".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    username text NOT NULL,
    password text,
    email text,
    "isActive" text,
    "resetPasswordToken" text,
    "resetPasswordExpires" timestamp with time zone,
    twitter json,
    github json,
    facebook json,
    google json,
    tumblr json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: activeRegions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."activeRegions" (
    rc_region text NOT NULL,
    region_name text,
    contact_name text,
    contact_email text,
    contact_phone text,
    is_active boolean,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: regionPermissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."regionPermissions" (
    id integer NOT NULL,
    rc_region text,
    user_id integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: regionPermissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."regionPermissions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: regionPermissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."regionPermissions_id_seq" OWNED BY public."regionPermissions".id;


--
-- Name: Account id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account" ALTER COLUMN id SET DEFAULT nextval('public."Account_id_seq"'::regclass);


--
-- Name: Admin id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Admin" ALTER COLUMN id SET DEFAULT nextval('public."Admin_id_seq"'::regclass);


--
-- Name: AdminGroup id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminGroup" ALTER COLUMN id SET DEFAULT nextval('public."AdminGroup_id_seq"'::regclass);


--
-- Name: Category id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category" ALTER COLUMN id SET DEFAULT nextval('public."Category_id_seq"'::regclass);


--
-- Name: LoginAttempt id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoginAttempt" ALTER COLUMN id SET DEFAULT nextval('public."LoginAttempt_id_seq"'::regclass);


--
-- Name: Message id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message" ALTER COLUMN id SET DEFAULT nextval('public."Message_id_seq"'::regclass);


--
-- Name: Note id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Note" ALTER COLUMN id SET DEFAULT nextval('public."Note_id_seq"'::regclass);


--
-- Name: RequestDuplicates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RequestDuplicates" ALTER COLUMN id SET DEFAULT nextval('public."RequestDuplicates_id_seq"'::regclass);


--
-- Name: Requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Requests" ALTER COLUMN id SET DEFAULT nextval('public."Requests_id_seq"'::regclass);


--
-- Name: SelectedCounties id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SelectedCounties" ALTER COLUMN id SET DEFAULT nextval('public."SelectedCounties_id_seq"'::regclass);


--
-- Name: Status id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Status" ALTER COLUMN id SET DEFAULT nextval('public."Status_id_seq"'::regclass);


--
-- Name: StatusLog id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StatusLog" ALTER COLUMN id SET DEFAULT nextval('public."StatusLog_id_seq"'::regclass);


--
-- Name: UsAddress id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UsAddress" ALTER COLUMN id SET DEFAULT nextval('public."UsAddress_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: regionPermissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."regionPermissions" ALTER COLUMN id SET DEFAULT nextval('public."regionPermissions_id_seq"'::regclass);


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: AdminGroup AdminGroup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminGroup"
    ADD CONSTRAINT "AdminGroup_pkey" PRIMARY KEY (id);


--
-- Name: Admin Admin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Admin"
    ADD CONSTRAINT "Admin_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: LoginAttempt LoginAttempt_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoginAttempt"
    ADD CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: Note Note_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Note"
    ADD CONSTRAINT "Note_pkey" PRIMARY KEY (id);


--
-- Name: RequestDuplicates RequestDuplicates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RequestDuplicates"
    ADD CONSTRAINT "RequestDuplicates_pkey" PRIMARY KEY (id);


--
-- Name: Requests Requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Requests"
    ADD CONSTRAINT "Requests_pkey" PRIMARY KEY (id);


--
-- Name: Requests Requests_serial_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Requests"
    ADD CONSTRAINT "Requests_serial_key" UNIQUE (serial);


--
-- Name: SelectedCounties SelectedCounties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SelectedCounties"
    ADD CONSTRAINT "SelectedCounties_pkey" PRIMARY KEY (id);


--
-- Name: StatusLog StatusLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StatusLog"
    ADD CONSTRAINT "StatusLog_pkey" PRIMARY KEY (id);


--
-- Name: Status Status_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Status"
    ADD CONSTRAINT "Status_pkey" PRIMARY KEY (id);


--
-- Name: UsAddress UsAddress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UsAddress"
    ADD CONSTRAINT "UsAddress_pkey" PRIMARY KEY (id);


--
-- Name: User User_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_email_key" UNIQUE (email);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: User User_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_username_key" UNIQUE (username);


--
-- Name: activeRegions activeRegions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."activeRegions"
    ADD CONSTRAINT "activeRegions_pkey" PRIMARY KEY (rc_region);


--
-- Name: regionPermissions regionPermissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."regionPermissions"
    ADD CONSTRAINT "regionPermissions_pkey" PRIMARY KEY (id);


--
-- Name: Account Account_UserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Admin Admin_AdminGroupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Admin"
    ADD CONSTRAINT "Admin_AdminGroupId_fkey" FOREIGN KEY ("AdminGroupId") REFERENCES public."AdminGroup"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Admin Admin_UserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Admin"
    ADD CONSTRAINT "Admin_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Message Message_UserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RequestDuplicates RequestDuplicates_requestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RequestDuplicates"
    ADD CONSTRAINT "RequestDuplicates_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES public."Requests"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Requests Requests_assigned_rc_region_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Requests"
    ADD CONSTRAINT "Requests_assigned_rc_region_fkey" FOREIGN KEY (assigned_rc_region) REFERENCES public."activeRegions"(rc_region) ON UPDATE CASCADE;


--
-- Name: Requests Requests_selected_county_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Requests"
    ADD CONSTRAINT "Requests_selected_county_fkey" FOREIGN KEY (selected_county) REFERENCES public."SelectedCounties"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: regionPermissions regionPermissions_rc_region_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."regionPermissions"
    ADD CONSTRAINT "regionPermissions_rc_region_fkey" FOREIGN KEY (rc_region) REFERENCES public."activeRegions"(rc_region) ON UPDATE CASCADE;


--
-- Name: regionPermissions regionPermissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."regionPermissions"
    ADD CONSTRAINT "regionPermissions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE;


--
-- PostgreSQL database dump complete
--

