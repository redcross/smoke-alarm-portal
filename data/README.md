Region Boundaries in the Red Cross North Central Division.
----------------------------------------------------------

We have PDF maps that show the exact boundaries of all Red Cross
Regions in the North Central Division.  However, our application code
needs county names as text, associated with state names also as text.

Even then we'll have a few issues with regions that slip over state
lines in a few places, and even with a few region boundaries that run
through certain counties.  But we'll deal with the edge cases later.
For the moment, 'selected_counties.json' just treats regions as
falling perfectly along state boundaries: if a county is in a given
state, and that state is in a region, then that county is assumed to
be in that region.  We can look at the maps and tweak the data later.

The counties-per-state data came from Wikipedia:

  * RCIA_REG_CO.pdf:
    - https://en.wikipedia.org/wiki/List_of_counties_in_Iowa
  
  * RCIDMT_REG_CO.pdf:
    - https://en.wikipedia.org/wiki/List_of_counties_in_Idaho
    - https://en.wikipedia.org/wiki/List_of_counties_in_Montana

  * RCIL_REG_CO.pdf:
    - https://en.wikipedia.org/wiki/List_of_counties_in_Illinois

  * RCKSNE_REG_CO.pdf:
    - https://en.wikipedia.org/wiki/List_of_counties_in_Kansas
    - https://en.wikipedia.org/wiki/List_of_counties_in_Nebraska

  * RCMN_REG_CO.pdf:
    - https://en.wikipedia.org/wiki/List_of_counties_in_Minnesota

  * RCMO_REG_CO.pdf:
    - https://en.wikipedia.org/wiki/List_of_counties_in_Missouri

  * RCNDSD_REG_CO.pdf:
    - https://en.wikipedia.org/wiki/List_of_counties_in_South_Dakota
    - https://en.wikipedia.org/wiki/List_of_counties_in_North_Dakota

  * RCWI_REG_CO.pdf:
    - https://en.wikipedia.org/wiki/List_of_counties_in_Wisconsin
