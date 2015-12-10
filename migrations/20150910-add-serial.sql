/* Add copyright header here.
 *
 * Create a column in the Requests table to store the serial numbers
 * created in issue #69.
 *
 * To run, start psql and enter "\i <path>/<to>/<filename>"
 */

ALTER TABLE "Requests" ADD COLUMN "serial" text;

