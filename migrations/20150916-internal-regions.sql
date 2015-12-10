/* Add copyright header here. */

ALTER TABLE "activeRegions" ADD COLUMN "internal_codes" text;

UPDATE "activeRegions" SET internal_codes = '12R04' WHERE rc_region = 'IDMT';
UPDATE "activeRegions" SET internal_codes = '34R08' WHERE rc_region = 'NDSD';
UPDATE "activeRegions" SET internal_codes = '27R12' WHERE rc_region = 'KSNE';
UPDATE "activeRegions" SET internal_codes = '23R12' WHERE rc_region = 'MINN';
UPDATE "activeRegions" SET internal_codes = '15R08' WHERE rc_region = 'IOWA';
UPDATE "activeRegions" SET internal_codes = '25R12' WHERE rc_region = 'WEMO';
UPDATE "activeRegions" SET internal_codes = '25R16' WHERE rc_region = 'EAMO';
UPDATE "activeRegions" SET internal_codes = '49R12' WHERE rc_region = 'WISC';
UPDATE "activeRegions" SET internal_codes = '13R04' WHERE rc_region = 'CHNI';
UPDATE "activeRegions" SET internal_codes = '13R12' WHERE rc_region = 'CSIL';

