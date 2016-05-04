/* Copyright (C) 2015, 2016  American Red Cross
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
UPDATE "activeRegions" SET rc_region = 'IDMT' WHERE rc_region = 'rc_idaho_montana';
UPDATE "activeRegions" SET rc_region = 'NDSD' WHERE rc_region = 'rc_dakotas';
UPDATE "activeRegions" SET rc_region = 'KSNE' WHERE rc_region = 'rc_kansas_nebraska_sw_iowa';
UPDATE "activeRegions" SET rc_region = 'MINN' WHERE rc_region = 'rc_minnesota';
UPDATE "activeRegions" SET rc_region = 'IOWA' WHERE rc_region = 'rc_iowa';
UPDATE "activeRegions" SET rc_region = 'WEMO' WHERE rc_region = 'rc_western_missouri';
UPDATE "activeRegions" SET rc_region = 'EAMO' WHERE rc_region = 'rc_eastern_missouri';
UPDATE "activeRegions" SET rc_region = 'WISC' WHERE rc_region = 'rc_wisconsin';
UPDATE "activeRegions" SET rc_region = 'CHNI' WHERE rc_region = 'rc_chicago_northern_illinois';
UPDATE "activeRegions" SET rc_region = 'CSIL' WHERE rc_region = 'rc_southern_illinois';

UPDATE "Requests" SET assigned_rc_region = 'IDMT' WHERE assigned_rc_region = 'rc_idaho_montana';
UPDATE "Requests" SET assigned_rc_region = 'NDSD' WHERE assigned_rc_region = 'rc_dakotas';
UPDATE "Requests" SET assigned_rc_region = 'KSNE' WHERE assigned_rc_region = 'rc_kansas_nebraska_sw_iowa';
UPDATE "Requests" SET assigned_rc_region = 'MINN' WHERE assigned_rc_region = 'rc_minnesota';
UPDATE "Requests" SET assigned_rc_region = 'IOWA' WHERE assigned_rc_region = 'rc_iowa';
UPDATE "Requests" SET assigned_rc_region = 'WEMO' WHERE assigned_rc_region = 'rc_western_missouri';
UPDATE "Requests" SET assigned_rc_region = 'EAMO' WHERE assigned_rc_region = 'rc_eastern_missouri';
UPDATE "Requests" SET assigned_rc_region = 'WISC' WHERE assigned_rc_region = 'rc_wisconsin';
UPDATE "Requests" SET assigned_rc_region = 'CHNI' WHERE assigned_rc_region = 'rc_chicago_northern_illinois';
UPDATE "Requests" SET assigned_rc_region = 'CSIL' WHERE assigned_rc_region = 'rc_southern_illinois';


UPDATE "SelectedCounties" SET region = 'IDMT' WHERE region = 'rc_idaho_montana';
UPDATE "SelectedCounties" SET region = 'NDSD' WHERE region = 'rc_dakotas';
UPDATE "SelectedCounties" SET region = 'KSNE' WHERE region = 'rc_kansas_nebraska_sw_iowa';
UPDATE "SelectedCounties" SET region = 'MINN' WHERE region = 'rc_minnesota';
UPDATE "SelectedCounties" SET region = 'IOWA' WHERE region = 'rc_iowa';
UPDATE "SelectedCounties" SET region = 'WEMO' WHERE region = 'rc_western_missouri';
UPDATE "SelectedCounties" SET region = 'EAMO' WHERE region = 'rc_eastern_missouri';
UPDATE "SelectedCounties" SET region = 'WISC' WHERE region = 'rc_wisconsin';
UPDATE "SelectedCounties" SET region = 'CHNI' WHERE region = 'rc_chicago_northern_illinois';
UPDATE "SelectedCounties" SET region = 'CSIL' WHERE region = 'rc_southern_illinois';


