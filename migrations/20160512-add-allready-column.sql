/*
 * Add a column showing whether AllReady is tracking this request or not
 * (see #196) 
*/

ALTER TABLE "Requests" ADD COLUMN "external_tracking" BOOLEAN;
