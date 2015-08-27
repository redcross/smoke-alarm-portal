-- This is a static complement to the dynamically generated data one would
-- get from running 'fake_request_data.js'.  Sometimes it's useful to
-- have a fixed, known set of sample data, for example for reproducing
-- a data-dependent bug.  Use "\i" in psql to import this sample data:
-- 
--   $ psql -U DB_USER_NAME -h localhost DB_NAME
--   Password for user DB_USER_NAME: *********
--   DB_NAME=> \i requests_static_sample_data.sql;

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

SET search_path = public, pg_catalog;

--
-- Data for Name: Requests; Type: TABLE DATA; Schema: public; Owner: smokealarmrw
--

COPY "Requests" (id, name, address, rc_region, city, state, zip, phone, email, permission_to_text, "createdAt", "updatedAt", "assignedRegion") FROM stdin;
1	Prima Primera	1234 Some Street	\N	Chicago	Illinois	60602	(777) 777-7777	prima@example.com	\N	2015-08-04 04:01:05.649-04	2015-08-04 04:01:05.72-04	\N
2	Renata Galliardo	1234 Prepping For Jim Demo	\N	Chicago	Illinois	60660	(773) 351-1729	rgalliardo@example.com	\N	2015-08-05 21:57:14.99-04	2015-08-05 21:57:15.078-04	\N
3	Yvonne Tramling	5238 S Hyde Park Blvd	\N	Chicago	Illinois	60615	312-884-6562	yvonnet@example.com	\N	2015-08-06 10:24:19.036-04	2015-08-06 10:24:19.106-04	\N
4	Yvonne Tramling	5238 S Hyde Park Blvd	\N	Chicago	Illinois	60615	3128846562	yvonnet@example.com	\N	2015-08-06 10:33:27.519-04	2015-08-06 10:33:27.571-04	\N
5	Yvonne Tramling	2200 W Harrison St	\N	Chicago	Illinois	60612	3129721003	yvonnet@example.com	\N	2015-08-07 11:19:06.613-04	2015-08-07 11:19:06.675-04	\N
6	Yvonne Tramling	2200 W Harrison St	\N	Chicago	Illinois	60612	3129721003	yvonnet@example.com	\N	2015-08-07 17:23:44.317-04	2015-08-07 17:23:44.363-04	\N
7	Yvonne Tramling	2200 W Harrison St	\N	Chicago	Illinois	60612	3127826452	yvonnet@example.com	\N	2015-08-12 10:11:49.427-04	2015-08-12 10:11:49.517-04	\N
11	Bruce Kern	50 Westport Court	\N	Bloomington	Illinois	61704	3096260550	bkern@example.com	\N	2015-08-20 10:04:24.55-04	2015-08-20 10:04:24.585-04	\N
10	Ziyuan Chen	1337 Navaho Trail	\N	Saint Charles	Missouri	63304	6188534326	ziyuanchen@example.com	\N	2015-08-20 10:04:20.205-04	2015-08-20 10:04:20.253-04	\N
8	Zeytune Armak	1715 WINDEMERE CT	\N	SUN PRAIRIE	Wisconsin	53590	920-426-1234	zarmak8@example.com	\N	2015-08-20 10:00:45.177-04	2015-08-20 10:00:45.238-04	\N
9	Nicholas Jones	300 s. washburn	\N	oshkosh	Wisconsin	53716	920-426-1234	njones@example.com	\N	2015-08-20 10:03:09.379-04	2015-08-20 10:03:09.435-04	\N
12	Nicholas Jones	300 s. washburn	\N	oshkosh	Wisconsin	53716	920-426-1234	njones@example.com	\N	2015-08-20 10:05:38.71-04	2015-08-20 10:05:38.828-04	\N
13	Walter Tremaine	873 S Harper Ave	\N	Chicago	Illinois	60637	444-555-1234	wtremaine@example.com	\N	2015-08-21 17:53:00.897-04	2015-08-21 17:53:00.926-04	2991
14	Sandra Guzman	3165 11th St S	\N	Moorhead	Minnesota	56560	2187971573	sandraguzman@example.com	\N	2015-08-24 09:42:51.799-04	2015-08-24 09:42:51.901-04	3293
\.


--
-- Name: Requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: smokealarmrw
--

SELECT pg_catalog.setval('"Requests_id_seq"', 14, true);


--
-- PostgreSQL database dump complete
--
