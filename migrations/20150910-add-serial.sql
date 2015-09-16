/* Add copyright header here.
 *
 * Create a column in the Requests table to store the serial numbers
 * created in issue #69.
 *
 */

ALTER TABLE "Requests" ADD COLUMN "serial" text;

