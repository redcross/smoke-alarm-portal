/* Add copyright header here.
 *
 * Create a column in the Requests table to store whether a request came
 * in via the site or sms, as in issue #121.
 *
 */

ALTER TABLE "activeRegions" ADD COLUMN "contact_phone" text;



