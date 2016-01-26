/* Add copyright header here.
 *
 * Create new columns in the Requests table to store the raw content of incoming texts.
 *
 */

ALTER TABLE "Requests" ADD COLUMN "sms_raw_address" text;
ALTER TABLE "Requests" ADD COLUMN "sms_raw_zip" text;
ALTER TABLE "Requests" ADD COLUMN "sms_raw_phone" text;

