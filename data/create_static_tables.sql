-- Create the Requests table.
-- 
-- Note that we don't drop it if it exists.  In that case, we error,
-- because the Requests data is too valuable to drop accidentally.
DROP TABLE "Requests";
CREATE SEQUENCE "Requests_id_seq";
CREATE TABLE "Requests" (
 "id"                    integer not null default nextval('"Requests_id_seq"'::regclass),
 "name"                  text,
 "address"               text,
 "address_2"             text,
 "city"                  text,
 "state"                 text,
 "zip"                   text,
 "permission_to_text"    boolean,
 "createdAt"             timestamp with time zone not null,
 "updatedAt"             timestamp with time zone not null
 );
ALTER TABLE "Requests" ADD CONSTRAINT "Requests_pkey" PRIMARY KEY (id);

-- Create the SelectedCounties table.
DROP TABLE IF EXISTS "SelectedCounties";
CREATE SEQUENCE "SelectedCounties_id_seq";
CREATE TABLE "SelectedCounties" (
 "id"                    integer not null default nextval('"SelectedCounties_id_seq"'::regclass),
 "region"                text,
 "state"                 text,
 "county"                text,
 "createdAt"             timestamp with time zone not null,
 "updatedAt"             timestamp with time zone not null
 );
ALTER TABLE "SelectedCounties" ADD CONSTRAINT "SelectedCounties_pkey" PRIMARY KEY (id);

-- Create the UsAddresses table.
DROP TABLE IF EXISTS "UsAddresses";
CREATE SEQUENCE "UsAddresses_id_seq";
CREATE TABLE "UsAddresses" (
 "id"                    integer not null default nextval('"UsAddresses_id_seq"'::regclass),
 "zip"                   text,
 "type"                  text,
 "primary_city"          text,
 "acceptable_cities"     text,
 "unacceptable_cities"   text,
 "state"                 text,
 "county"                text,
 "timezone"              text,
 "area_codes"            text,
 "latitude"              text,
 "longitude"             text,
 "world_region"          text,
 "country"               text,
 "decommissioned"        boolean,
 "estimated_population"  integer,
 "notes"                 text,
 "createdAt"             timestamp with time zone not null,
 "updatedAt"             timestamp with time zone not null
 );
ALTER TABLE "UsAddresses" ADD CONSTRAINT "UsAddresses_pkey" PRIMARY KEY (id);
