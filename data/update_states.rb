#!/usr/bin/ruby

require 'pry'
state_for_abbrev = {
"AL":"Alabama",
"AK":"Alaska",
"AZ":"Arizona",
"AR":"Arkansas",
"CA":"California",
"CO":"Colorado",
"CT":"Connecticut",
"DE":"Delaware",
"FL":"Florida",
"GA":"Georgia",
"HI":"Hawaii",
"ID":"Idaho",
"IL":"Illinois",
"IN":"Indiana",
"IA":"Iowa",
"KS":"Kansas",
"KY":"Kentucky",
"LA":"Louisiana",
"ME":"Maine",
"MD":"Maryland",
"MA":"Massachusetts",
"MI":"Michigan",
"MN":"Minnesota",
"MS":"Mississippi",
"MO":"Missouri",
"MT":"Montana",
"NE":"Nebraska",
"NV":"Nevada",
"NH":"New Hampshire",
"NJ":"New Jersey",
"NM":"New Mexico",
"NY":"New York",
"NC":"North Carolina",
"ND":"North Dakota",
"OH":"Ohio",
"OK":"Oklahoma",
"OR":"Oregon",
"PA":"Pennsylvania",
"PR":"Puerto Rico",
"RI":"Rhode Island",
"SC":"South Carolina",
"SD":"South Dakota",
"TN":"Tennessee",
"TX":"Texas",
"UT":"Utah",
"VT":"Vermont",
"VA":"Virginia",
"WA":"Washington",
"WV":"West Virginia",
"WI":"Wisconsin",
"WY":"Wyoming",
"DC":"Washington DC",
"AA":"Armed Forces Americas",
"AE":"Armed Forces Europe",
"AP":"Armed Forces Pacific"
}

# Open state database
s = IO.read("data/us_addresses.json")

state_for_abbrev.each do |abbrev, state|
  s = s.gsub("state\":\"#{abbrev.to_s}\"","state\":\"#{state.to_s}\"")
end

output = File.open("data/us_addresses_fixed.json","w" )
output << s
output.close
