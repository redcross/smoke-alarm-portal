/* Set region code to 'XXXX' where assigned_rc_region is null */

UPDATE "Requests" SET "assigned_rc_region" = 'XXXX' WHERE "assigned_rc_region" IS NULL;
