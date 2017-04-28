/* 
 * Instead of having the "Admin" and "AdminGroup" tables, which aren't
 * directly related to the "User" table, link Users directly to their
 * AdminGroup.  
*/

ALTER TABLE "User" ADD COLUMN "adminGroupId" integer;
-- add the key
ALTER TABLE "User" ADD FOREIGN KEY ("adminGroupId") REFERENCES "AdminGroup"(id);

