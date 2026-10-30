type ExtraOrg = {
  name: string;
  kind: "ANSP" | "TRAINING_ACADEMY";
  country: string;
  city: string;
  lat: number;
  lng: number;
  website?: string;
  email: string;
  contactTitle?: string;
  extraContacts?: { email: string; title: string }[];
  atmSystem?: string;
  simulatorKind?: "RADAR" | "TOWER" | "RADAR_AND_TOWER";
  simulatorVendor?: string;
  notes?: string;
};

const gap =
  "The operational ATM system and simulator vendor were not found in a public source. Named officers and unpublished prices are omitted.";

const asecnaAtm =
  "Thales TopSky-ATC. ASECNA published a contract for TopSky-ATC systems across its centres.";
const asecnaNote =
  "Air navigation is provided by ASECNA. ATC training for these states is at EAMAC in Niamey, EAMACSEC@asecna.org. " + gap;
const cocesnaAtm =
  "Indra ATC systems. Indra published a 2023 contract of €24.6 million to upgrade nine centres, including CENAMER.";
const cocesnaNote =
  "Upper airspace is provided by COCESNA. ATC training for member states is at ICCAE. The published mailbox is info@cocesna.org.";

function ansp(
  name: string,
  country: string,
  city: string,
  lat: number,
  lng: number,
  email: string,
  website: string,
  extra?: Partial<ExtraOrg>
): ExtraOrg {
  return {
    name,
    kind: "ANSP",
    country,
    city,
    lat,
    lng,
    website,
    email,
    contactTitle: "Aeronautical information",
    notes: gap,
    ...extra,
  };
}

function school(
  name: string,
  country: string,
  city: string,
  lat: number,
  lng: number,
  email: string,
  website: string,
  notes: string,
  extra?: Partial<ExtraOrg>
): ExtraOrg {
  return {
    name,
    kind: "TRAINING_ACADEMY",
    country,
    city,
    lat,
    lng,
    website,
    email,
    contactTitle: "Training enquiries",
    notes,
    ...extra,
  };
}

const asecna: Array<[string, string, number, number]> = [
  ["Benin", "Cotonou", 6.37, 2.391],
  ["Burkina Faso", "Ouagadougou", 12.372, -1.527],
  ["Cameroon", "Yaoundé", 3.848, 11.502],
  ["Central African Republic", "Bangui", 4.394, 18.558],
  ["Chad", "N'Djamena", 12.134, 15.055],
  ["Comoros", "Moroni", -11.699, 43.256],
  ["Republic of the Congo", "Brazzaville", -4.264, 15.283],
  ["Côte d'Ivoire", "Abidjan", 5.36, -4.008],
  ["Equatorial Guinea", "Malabo", 3.75, 8.783],
  ["Gabon", "Libreville", 0.39, 9.454],
  ["Guinea-Bissau", "Bissau", 11.864, -15.598],
  ["Madagascar", "Antananarivo", -18.879, 47.507],
  ["Mali", "Bamako", 12.639, -8.003],
  ["Mauritania", "Nouakchott", 18.074, -15.958],
  ["Niger", "Niamey", 13.512, 2.125],
  ["Togo", "Lomé", 6.137, 1.212],
];

const cocesna: Array<[string, string, number, number]> = [
  ["Belize", "Belize City", 17.504, -88.196],
  ["Costa Rica", "San José", 9.928, -84.091],
  ["El Salvador", "San Salvador", 13.693, -89.218],
  ["Guatemala", "Guatemala City", 14.634, -90.507],
  ["Nicaragua", "Managua", 12.115, -86.237],
];

const easternCaribbean: Array<[string, string, number, number]> = [
  ["Antigua and Barbuda", "St. John's", 17.127, -61.846],
  ["Dominica", "Roseau", 15.301, -61.388],
  ["Grenada", "St. George's", 12.056, -61.749],
  ["Saint Kitts and Nevis", "Basseterre", 17.295, -62.725],
  ["Saint Lucia", "Castries", 14.011, -60.989],
  ["Saint Vincent and the Grenadines", "Kingstown", 13.16, -61.224],
];

export const EXTRA_ORGANIZATIONS: ExtraOrg[] = [
  ansp("ASECNA", "Senegal", "Dakar", 14.717, -17.467, "dnaai@asecna.org", "https://www.asecna.aero", {
    atmSystem: asecnaAtm,
    notes: "ASECNA headquarters. " + asecnaNote,
  }),
  ...asecna.map(([country, city, lat, lng]) =>
    ansp(`ASECNA (${country})`, country, city, lat, lng, "dnaai@asecna.org", "https://www.asecna.aero", {
      atmSystem: asecnaAtm,
      notes: asecnaNote,
    })
  ),
  ansp("COCESNA", "Honduras", "Tegucigalpa", 14.094, -87.207, "ais_pub@cocesna.org", "https://www.cocesna.org", {
    extraContacts: [{ email: "info@cocesna.org", title: "Public enquiry" }],
    atmSystem: cocesnaAtm,
    notes: cocesnaNote,
  }),
  ...cocesna.map(([country, city, lat, lng]) =>
    ansp(`COCESNA (${country})`, country, city, lat, lng, "ais_pub@cocesna.org", "https://www.cocesna.org", {
      atmSystem: cocesnaAtm,
      notes: cocesnaNote,
    })
  ),
  ...easternCaribbean.map(([country, city, lat, lng]) =>
    ansp(`Eastern Caribbean AIS (${country})`, country, city, lat, lng, "aispublications@caa.gov.tt", "https://www.caa.gov.tt", {
      notes: "The published aeronautical-information mailbox for this state is the Eastern Caribbean office in Trinidad and Tobago. " + gap,
    })
  ),

  ansp("ENNA", "Algeria", "Algiers", 36.754, 3.059, "algerian.ais@sia-enna.dz", "https://www.enna.dz", {
    extraContacts: [{ email: "dgenna@enna.dz", title: "Public enquiry" }],
  }),
  ansp("Civil Aviation Authority of Botswana", "Botswana", "Gaborone", -24.655, 25.907, "aishq@caab.co.bw", "https://www.caab.co.bw"),
  ansp("Burundi CAA", "Burundi", "Bujumbura", -3.382, 29.364, "aacbburundi@gmail.com", "https://www.aacb.gov.bi"),
  ansp("ASA", "Cabo Verde", "Praia", 14.918, -23.509, "sgia@asa.cv", "https://www.asa.cv"),
  ansp("AAC RDC", "Democratic Republic of the Congo", "Kinshasa", -4.322, 15.313, "info@aacrdc.org", "https://www.aacrdc.org"),
  ansp("Djibouti AIS", "Djibouti", "Djibouti", 11.589, 43.145, "ais@aeroport-jib.aero", "https://www.aeroport-jib.aero"),
  ansp("Eritrea CAA", "Eritrea", "Asmara", 15.338, 38.932, "asmcaya@sita.gmsmail.com", "https://www.caa.gov.er"),
  ansp("Eswatini CAA", "Kingdom of eSwatini", "Mbabane", -26.306, 31.137, "info@eswacaa.co.sz", "https://www.eswacaa.co.sz"),
  ansp("Ethiopian Civil Aviation Authority", "Ethiopia", "Addis Ababa", 9.033, 38.75, "caa.airnav@ethionet.et", "http://www.ecaa.gov.et", {
    extraContacts: [{ email: "aimethiopia@ecaa.gov.et", title: "Aeronautical information" }],
    contactTitle: "Air navigation",
  }),
  ansp("Gambia CAA", "The Gambia", "Banjul", 13.454, -16.579, "aispubs@gcaa.aero", "https://www.gcaa.aero"),
  ansp("Ghana CAA", "Ghana", "Accra", 5.603, -0.187, "ais@caa.com.gh", "https://www.gcaa.com.gh"),
  ansp("Roberts FIR (Guinea)", "Guinea", "Conakry", 9.509, -13.712, "centralais@robertsfir.org", "https://www.robertsfir.org", {
    notes: "Guinea, Liberia, and Sierra Leone share the Roberts FIR aeronautical-information office. " + gap,
  }),
  ansp("Roberts FIR (Liberia)", "Liberia", "Monrovia", 6.315, -10.807, "centralais@robertsfir.org", "https://www.robertsfir.org", {
    notes: "Guinea, Liberia, and Sierra Leone share the Roberts FIR aeronautical-information office. " + gap,
  }),
  ansp("Roberts FIR (Sierra Leone)", "Sierra Leone", "Freetown", 8.484, -13.234, "centralais@robertsfir.org", "https://www.robertsfir.org", {
    notes: "Guinea, Liberia, and Sierra Leone share the Roberts FIR aeronautical-information office. " + gap,
  }),
  ansp("Kenya Civil Aviation Authority", "Kenya", "Nairobi", -1.286, 36.817, "ais@kcaa.or.ke", "https://www.kcaa.or.ke"),
  ansp("Lesotho DCA", "Lesotho", "Maseru", -29.315, 27.487, "ais@mia.gov.ls", "https://www.mia.gov.ls"),
  ansp("Libya CAA", "Libya", "Tripoli", 32.887, 13.191, "ais@caa.gov.ly", "https://www.caa.gov.ly"),
  ansp("Malawi CAA", "Malawi", "Lilongwe", -13.963, 33.774, "aishq@dca.gov.mw", "https://www.caa.gov.mw"),
  ansp("Mauritius AIS", "Mauritius", "Port Louis", -20.161, 57.498, "ais@govmu.org", "https://www.govmu.org"),
  ansp("ONDA", "Morocco", "Casablanca", 33.573, -7.59, "sia-maroc@onda.ma", "https://www.onda.ma"),
  ansp("IACM Mozambique", "Mozambique", "Maputo", -25.966, 32.573, "ais@iacm.gov.mz", "https://www.iacm.gov.mz"),
  ansp("NAMA", "Nigeria", "Abuja", 9.057, 7.495, "aishq@nama.gov.ng", "https://www.nama.gov.ng"),
  ansp("Rwanda Airports Company", "Rwanda", "Kigali", -1.944, 30.062, "ais@rac.co.rw", "https://www.rac.co.rw"),
  ansp("Seychelles CAA", "Seychelles", "Victoria", -4.62, 55.452, "ais@scaa.sc", "https://www.scaa.sc"),
  ansp("Somalia CAA", "Somalia", "Mogadishu", 2.047, 45.318, "ais@scaa.gov.so", "https://www.scaa.gov.so"),
  ansp("South Sudan CAA", "South Sudan", "Juba", 4.859, 31.582, "caa@sscaa.aero", "https://www.sscaa.aero"),
  ansp("Tanzania CAA", "Tanzania", "Dar es Salaam", -6.792, 39.208, "ais@tcaa.go.tz", "https://www.tcaa.go.tz"),
  ansp("OACA", "Tunisia", "Tunis", 36.806, 10.181, "tunisia-ais@oaca.nat.tn", "https://www.oaca.nat.tn"),
  ansp("Uganda CAA", "Uganda", "Entebbe", 0.051, 32.464, "ais@caa.co.ug", "https://www.caa.co.ug"),
  ansp("Zambia Airports Corporation", "Zambia", "Lusaka", -15.387, 28.323, "ais.lusaka@zacl.aero", "https://www.zacl.aero"),
  ansp("Zimbabwe CAA", "Zimbabwe", "Harare", -17.829, 31.053, "ais@caaz.co.zw", "https://www.caaz.co.zw"),
  ansp("GACA DPR Korea", "Dem. Rep. Korea", "Pyongyang", 39.019, 125.755, "gaca@silibank.com", "https://www.caa.gov.kp"),

  ansp("BANSA", "Bahamas", "Nassau", 25.048, -77.355, "ais@bansabahamas.com", "https://www.bansabahamas.com"),
  ansp("NAABOL", "Bolivia", "La Paz", -16.5, -68.15, "ais@naabol.gob.bo", "https://www.naabol.gob.bo"),
  ansp("DGAC Chile", "Chile", "Santiago", -33.449, -70.669, "aischile@dgac.gob.cl", "https://www.dgac.gob.cl", {
    extraContacts: [{ email: "dgac@dgac.cl", title: "Public enquiry" }],
  }),
  ansp("Aerocivil", "Colombia", "Bogotá", 4.711, -74.072, "ais@aerocivil.gov.co", "https://www.aerocivil.gov.co"),
  ansp("IACC", "Cuba", "Havana", 23.114, -82.367, "ais@iacc.avianet.cu", "https://www.iacc.gob.cu"),
  ansp("IDAC", "Dominican Republic", "Santo Domingo", 18.486, -69.931, "ais@idac.gov.do", "https://www.idac.gob.do"),
  ansp("DGAC Ecuador", "Ecuador", "Quito", -0.18, -78.468, "ais_ecuador@aviacioncivil.gob.ec", "https://www.aviacioncivil.gob.ec"),
  ansp("GCAA Guyana", "Guyana", "Georgetown", 6.801, -58.155, "aisguyana@gcaa-gy.org", "https://www.gcaa-gy.org"),
  ansp("OFNAC", "Haiti", "Port-au-Prince", 18.594, -72.307, "division.ais@ofnac.gouv.ht", "https://www.ofnac.gouv.ht"),
  ansp("JCAA", "Jamaica", "Kingston", 17.971, -76.793, "aisjamaica@jcaa.gov.jm", "https://www.jcaa.gov.jm"),
  ansp("Panama AAC", "Panama", "Panama City", 8.983, -79.52, "ais@aeronautica.gob.pa", "https://www.aeronautica.gob.pa"),
  ansp("DINAC", "Paraguay", "Asunción", -25.263, -57.576, "ais_publicaciones@dinac.gov.py", "https://www.dinac.gov.py"),
  ansp("CORPAC", "Peru", "Lima", -12.046, -77.043, "aisperu@corpac.gob.pe", "https://www.corpac.gob.pe"),
  ansp("CAD Suriname", "Suriname", "Paramaribo", 5.852, -55.204, "ais@cadsur.sr", "https://www.cadsur.sr"),
  ansp("DINACIA", "Uruguay", "Montevideo", -34.901, -56.164, "aispub@dinacia.gub.uy", "https://www.dinacia.gub.uy"),
  ansp("INAC Venezuela", "Venezuela", "Caracas", 10.48, -66.904, "ais@inac.gob.ve", "https://www.inac.gob.ve"),
  ansp("Trinidad and Tobago CAA", "Trinidad and Tobago", "Port of Spain", 10.66, -61.508, "aispublications@caa.gov.tt", "https://www.caa.gov.tt"),

  ansp("ACAA Afghanistan", "Afghanistan", "Kabul", 34.555, 69.208, "aip@acaa.gov.af", "https://www.acaa.gov.af"),
  ansp("Bahrain AIM", "Bahrain", "Manama", 26.228, 50.586, "sdc@mtt.gov.bh", "https://www.mtt.gov.bh"),
  ansp("CAAB Bangladesh", "Bangladesh", "Dhaka", 23.811, 90.413, "adais@caab.gov.bd", "https://www.caab.gov.bd"),
  ansp("Bhutan DoAT", "Bhutan", "Thimphu", 27.472, 89.639, "aim@doat.gov.bt", "https://www.doat.gov.bt"),
  ansp("Brunei DCA", "Brunei Darussalam", "Bandar Seri Begawan", 4.903, 114.94, "ais.brunei@dca.gov.bn", "https://www.dca.gov.bn"),
  ansp("CATS Cambodia", "Cambodia", "Phnom Penh", 11.556, 104.928, "aim.coordinator@cats.com.kh", "https://www.cats.com.kh"),
  ansp("Iran Airports Company", "Iran", "Tehran", 35.689, 51.389, "ais_iran@airport.ir", "https://www.airport.ir"),
  ansp("GCANS", "Iraq", "Baghdad", 33.315, 44.366, "ais.hq@gcans.gov.iq", "https://www.gcans.gov.iq"),
  ansp("Israel Airports Authority", "Israel", "Tel Aviv", 32.085, 34.782, "aip@mot.gov.il", "https://www.iaa.gov.il"),
  ansp("CARC Jordan", "Jordan", "Amman", 31.953, 35.91, "ais.hq@carc.gov.jo", "https://www.carc.gov.jo"),
  ansp("Kuwait DGCA", "Kuwait", "Kuwait City", 29.376, 47.978, "aip@dgca.gov.kw", "https://www.dgca.gov.kw"),
  ansp("Beirut Airport AIS", "Lebanon", "Beirut", 33.893, 35.501, "ais@beirutairport.gov.lb", "https://www.beirutairport.gov.lb"),
  ansp("Oman CAA", "Oman", "Muscat", 23.588, 58.383, "sdc@caa.gov.om", "https://www.caa.gov.om"),
  ansp("Pakistan Airports Authority", "Pakistan", "Karachi", 24.861, 67.01, "aisophq@paa.gov.pk", "https://www.paa.gov.pk"),
  ansp("Syria CAA", "Syria", "Damascus", 33.513, 36.292, "info@scaa.sy", "https://www.scaa.sy"),
  ansp("Yemen CAMA", "Yemen", "Sana'a", 15.369, 44.191, "aisyemen@gmail.com", "https://www.cama.gov.ye"),
  ansp("VATM", "Vietnam", "Hanoi", 21.028, 105.854, "aip@vnaic.vn", "https://vatm.vn"),
  ansp("Mongolia CAA", "Mongolia", "Ulaanbaatar", 47.886, 106.906, "aip@mcaa.gov.mn", "https://www.mcaa.gov.mn"),
  ansp("Myanmar AIS", "Myanmar", "Yangon", 16.84, 96.173, "aiso@ais.gov.mm", "https://www.ais.gov.mm"),
  ansp("CAAN", "Nepal", "Kathmandu", 27.717, 85.324, "caanais@caanepal.gov.np", "https://www.caanepal.gov.np"),
  ansp("Laos DCA", "Lao PDR", "Vientiane", 17.975, 102.633, "info@dcal.gov.la", "https://www.dcal.gov.la"),
  ansp("MNATS", "Maldives", "Malé", 4.175, 73.509, "aishq@mnats.aero", "https://www.mnats.aero"),
  ansp("Sri Lanka AIM", "Sri Lanka", "Colombo", 6.927, 79.861, "aimhq@airport.lk", "https://www.airport.lk"),
  ansp("Timor-Leste AACTL", "Timor-Leste", "Dili", -8.556, 125.56, "dna@aactl.gov.tl", "https://www.aactl.gov.tl"),
  ansp("Fiji Airports", "Fiji", "Nadi", -17.755, 177.443, "ais@afl.com.fj", "https://www.fijiairports.com.fj"),
  ansp("NiuSky Pacific", "Papua New Guinea", "Port Moresby", -9.443, 147.18, "enquiries@niuskypacific.com.pg", "https://www.niuskypacific.com.pg", {
    contactTitle: "Public enquiry",
    extraContacts: [{ email: "ais@niuskypacific.com.pg", title: "Aeronautical information" }],
  }),
  ansp("Kiribati DCA", "Kiribati", "Tarawa", 1.329, 172.979, "dca@tski.net.ki", "https://www.mict.gov.ki"),
  ansp("Micronesia DCA", "Micronesia", "Palikir", 6.918, 158.161, "aviation@tci.gov.fm", "https://www.tci.gov.fm"),
  ansp("Samoa AIS", "Samoa", "Apia", -13.833, -171.766, "info@aeropath.aero", "https://www.aeropath.aero", {
    notes: "Samoa aeronautical information is published by Aeropath, part of Airways New Zealand. " + gap,
  }),
  ansp("Tonga AIS", "Tonga", "Nuku'alofa", -21.139, -175.205, "info@aeropath.aero", "https://www.aeropath.aero", {
    notes: "Tonga aeronautical information is published by Aeropath, part of Airways New Zealand. " + gap,
  }),
  ansp("Vanuatu AIS", "Vanuatu", "Port Vila", -17.734, 168.327, "info@aeropath.aero", "https://www.aeropath.aero", {
    notes: "Vanuatu aeronautical information is published by Aeropath, part of Airways New Zealand. " + gap,
  }),
  ansp("Nauru AIS", "Nauru", "Yaren", -0.547, 166.92, "info@aeropath.aero", "https://www.aeropath.aero", {
    notes: "Nauru aeronautical information is published by Aeropath, part of Airways New Zealand. " + gap,
  }),
  ansp("Tuvalu AIS", "Tuvalu", "Funafuti", -8.521, 179.197, "info@aeropath.aero", "https://www.aeropath.aero", {
    notes: "Tuvalu aeronautical information is published by Aeropath, part of Airways New Zealand. " + gap,
  }),
  ansp("Cook Islands AIS", "Cook Islands", "Avarua", -21.207, -159.776, "aim@airways.co.nz", "https://www.aeropath.aero", {
    notes: "Cook Islands aeronautical information is published by Airways New Zealand. " + gap,
  }),
  ansp("Niue AIS", "Niue", "Alofi", -19.056, -169.918, "aim@aeropath.aero", "https://www.aeropath.aero", {
    notes: "Niue aeronautical information is published by Aeropath, part of Airways New Zealand. " + gap,
  }),
  ansp("ENNA Angola", "Angola", "Luanda", -8.839, 13.289, "ais.enana@snet.co.ao", "https://www.anac.ao", {
    notes: "The published AIS mailbox is ais.enana@snet.co.ao. Named ENNA officers are omitted. " + gap,
  }),
  ansp("Namibia Civil Aviation Authority", "Namibia", "Windhoek", -22.56, 17.065, "aim@ncaa.na", "https://www.ncaa.com.na", {
    contactTitle: "Aeronautical information",
    extraContacts: [{ email: "info@ncaa.na", title: "Public enquiry" }, { email: "aip@ncaa.na", title: "AIP subscriptions" }],
  }),
  ansp("NANSC", "Egypt", "Cairo", 30.044, 31.236, "info@nansceg.net", "https://nansceg.net", {
    contactTitle: "Public enquiry",
    notes: "National Air Navigation Services Company. The public mailbox is info@nansceg.net. Named officers are omitted. " + gap,
  }),
  ansp("Eastern Caribbean AIS (Barbados)", "Barbados", "Bridgetown", 13.097, -59.613, "aispublications@caa.gov.tt", "https://www.caa.gov.tt", {
    notes: "Barbados aeronautical information is published with the Eastern Caribbean AIP from Trinidad and Tobago. " + gap,
  }),
  ansp("Kyrgyzstan AIS", "Kyrgyzstan", "Bishkek", 42.874, 74.57, "ais_kyrgyzstan@bk.ru", "https://www.caa.kg", {
    notes: "EUROCONTROL publishes ais_kyrgyzstan@bk.ru as the AIS contact. " + gap,
  }),
  ansp("Tajikistan Airnav", "Tajikistan", "Dushanbe", 38.56, 68.774, "ais@airnav.tj", "https://www.airnav.tj"),
  ansp("Ashgabat Airport AIS", "Turkmenistan", "Ashgabat", 37.96, 58.326, "ais@ashgabatairport.gov.tm", "https://www.ashgabatairport.gov.tm"),
  ansp("ENASA", "Sao Tome and Principe", "São Tomé", 0.337, 6.731, "ais.fpst@gmail.com", "https://www.enasa-stp.com", {
    extraContacts: [{ email: "enasa@enasa-stp.com", title: "ENASA" }],
    notes: "EUROCONTROL publishes ais.fpst@gmail.com for ENASA. " + gap,
  }),
  ansp("Naviair (Greenland)", "Greenland", "Nuuk", 64.181, -51.694, "aim@naviair.dk", "https://www.naviair.dk", {
    notes: "Greenland aeronautical information is published by Naviair in Denmark. " + gap,
  }),
  ansp("DSNA (New Caledonia)", "New Caledonia", "Nouméa", -22.276, 166.458, "sia-direction@aviation-civile.gouv.fr", "https://www.ecologie.gouv.fr", {
    notes: "New Caledonia aeronautical information is published by the French DSNA.",
  }),
  ansp("Falkland Islands Civil Aviation", "Falkland Islands / Malvinas", "Stanley", -51.694, -57.852, "civilaviation@sec.gov.fk", "https://www.falklands.gov.fk"),
  ansp("Macao AACM", "Macao", "Macao", 22.199, 113.544, "aacm@aacm.gov.mo", "https://www.aacm.gov.mo"),
  ansp("FAA (Puerto Rico)", "Puerto Rico", "San Juan", 18.466, -66.106, "9-AJV-8-HQ-Correspondence@faa.gov", "https://www.faa.gov", {
    atmSystem: "United States oceanic and terminal automation. Puerto Rico is published by the FAA.",
    notes: "Puerto Rico air navigation is provided by the FAA.",
  }),

  ansp("Belaeronavigatsia", "Belarus", "Minsk", 53.9, 27.559, "ais@ban.by", "https://www.ban.by"),
  ansp("Air Navigation Services Agency of Kosovo", "Kosovo", "Pristina", 42.663, 21.165, "ais@rks-gov.net", "https://www.rks-gov.net"),
  ansp("SMATSA (Montenegro)", "Montenegro", "Podgorica", 42.441, 19.263, "ais@smatsa.rs", "https://www.smatsa.rs", {
    notes: "Montenegro air navigation is provided by SMATSA, based in Belgrade. " + gap,
  }),
  ansp("State ATM Corporation", "Russian Federation", "Moscow", 55.756, 37.617, "office@caica.ru", "https://www.gkovd.ru", {
    notes: "The published Russian aeronautical-information mailbox is office@caica.ru. " + gap,
  }),
  ansp("DSNA (Monaco)", "Monaco", "Monaco", 43.738, 7.424, "sia-direction@aviation-civile.gouv.fr", "https://www.ecologie.gouv.fr", {
    atmSystem: "4-FLIGHT, the French area-control system. Monaco has no separate ANSP.",
    notes: "Air traffic services for Monaco are provided by the French DSNA.",
  }),
  ansp("ENAV (San Marino)", "San Marino", "San Marino", 43.933, 12.447, "aip@enav.it", "https://www.enav.it", {
    notes: "San Marino has no separate ANSP. Air navigation is provided by ENAV.",
  }),
  ansp("Skyguide (Liechtenstein)", "Liechtenstein", "Vaduz", 47.141, 9.521, "info@skyguide.ch", "https://www.skyguide.ch", {
    contactTitle: "Public enquiry",
    notes: "Liechtenstein airspace is handled by Skyguide. " + gap,
  }),
  ansp("ENAIRE (Andorra)", "Andorra", "Andorra la Vella", 42.506, 1.522, "ais@enaire.es", "https://www.enaire.es", {
    atmSystem: "SACTA (Indra), the Spanish system. Andorra has no separate ANSP.",
    notes: "Andorra has no separate air navigation provider. Neighbouring services are ENAIRE and DSNA.",
  }),

  school("CQRENA", "Algeria", "Algiers", 36.737, 3.086, "cqrena@enna.dz", "https://www.enna.dz", "ENNA ATC training centre in Algiers. Simulator vendor was not published."),
  school("Ghana Civil Aviation Training Academy", "Ghana", "Accra", 5.605, -0.172, "gata@caa.com.gh", "https://www.gcaa.com.gh/gata", "ATC courses at Kotoka International Airport, including aerodrome and surveillance. Simulator vendor was not published.", { simulatorKind: "RADAR_AND_TOWER" }),
  school("EAMAC", "Niger", "Niamey", 13.523, 2.106, "EAMACSEC@asecna.org", "https://eamac.ne", "ASECNA school for air navigation training, used by the ASECNA member states. Simulator vendor was not published."),
  school("East African School of Aviation", "Kenya", "Nairobi", -1.319, 36.927, "info@easa.ac.ke", "https://www.easa.ac.ke", "KCAA school at Embakasi. It publishes a basic ATC course. Simulator vendor was not published."),
  school("Nigerian College of Aviation Technology", "Nigeria", "Zaria", 11.085, 7.72, "info@ncat.gov.ng", "https://ncat.gov.ng", "The college publishes air traffic services courses. Simulator vendor was not published."),
  school("CAAN Academy", "Nepal", "Bhaktapur", 27.671, 85.429, "caacademy@caanepal.gov.np", "https://academy.caanepal.gov.np", "Civil aviation academy that runs basic ATS and aerodrome-control courses. Simulator vendor was not published."),
  school("Civil Aviation Training Center Philippines", "Philippines", "Pasay", 14.512, 121.02, "catc@caap.gov.ph", "https://www.caap.gov.ph", "CAAP centre. Its catalogue includes a basic air traffic service course. Simulator vendor was not published."),
  ansp("Civil Aviation Authority of the Philippines", "Philippines", "Manila", 14.59, 120.98, "ais_operations@caap.gov.ph", "https://www.caap.gov.ph"),
  school("CIPE", "Argentina", "Ezeiza", -34.822, -58.535, "infocipe@anac.gob.ar", "https://www.argentina.gob.ar/anac/cipe", "National aviation training centre at Ezeiza. It supports air traffic services training. Simulator vendor was not published."),
  school("Czech Air Navigation Institute", "Czech Republic", "Prague", 50.101, 14.263, "cani@ans.cz", "https://www.cani.cz", "ANS CR institute for initial and development ATCO training at Prague Ruzyně. Simulator vendor was not published."),
  school("BULATSA Training Centre", "Bulgaria", "Sofia", 42.71, 23.33, "atsainfo@bulatsa.com", "https://www.bulatsa.com", "Certified ATCO training centre. A named officer is also published, and that personal mailbox is not stored."),
  school("PANSA Training", "Poland", "Warsaw", 52.232, 20.99, "business@pansa.pl", "https://www.pansa.pl", "PANSA publishes familiarisation courses on tower, approach, and area simulators. The simulator vendor was not published.", { simulatorKind: "RADAR_AND_TOWER" }),
  school("SMATSA Training Centre", "Serbia", "Belgrade", 44.819, 20.307, "kl@smatsa.rs", "https://www.smatsa.rs", "ANS training centre at Belgrade Airport. It publishes simulator training. The vendor was not published."),
  school("ROMATSA Training Centre", "Romania", "Bucharest", 44.45, 26.09, "info@romatsa.ro", "https://tcaem.romatsa.ro", "ATCO courses for area, approach, and tower. The course site lists a named officer, so that personal mailbox is not stored.", { simulatorKind: "RADAR_AND_TOWER" }),
  school("ICCAE", "Honduras", "Tegucigalpa", 14.06, -87.217, "info@cocesna.org", "https://www.cocesna.org", "Central American aeronautical training institute for COCESNA member states. Simulator vendor was not published."),
  school("NiuSky Pacific ATC Training", "Papua New Guinea", "Port Moresby", -9.48, 147.15, "enquiries@niuskypacific.com.pg", "https://www.niuskypacific.com.pg", "In-house ATC cadet programme. It includes simulator exercises. The vendor was not published."),
  school("Civil Aviation Training Center Thailand", "Thailand", "Bangkok", 13.807, 100.56, "info@catc.or.th", "https://www.catc.or.th", "National aviation training centre with an air traffic services department. Simulator vendor was not published."),
  school("Malaysia Aviation Academy", "Malaysia", "Sepang", 2.745, 101.71, "mava@caam.gov.my", "https://mava.caam.gov.my", "CAAM academy, certified as an ATC approved training organisation since 2015. Simulator vendor was not published."),
  school("Politeknik Penerbangan Indonesia Curug", "Indonesia", "Tangerang", -6.293, 106.569, "ppi@ppicurug.ac.id", "https://ppicurug.ac.id", "National aviation polytechnic. Simulator vendor was not published."),
  school("Civil Aviation Training Institute Pakistan", "Pakistan", "Hyderabad", 25.396, 68.357, "AdlD.Academics@paa.gov.pk", "https://catipakistan.com.pk", "Pakistan Airports Authority training institute. Simulator vendor was not published."),
  school("Ethiopian Civil Aviation Training Center", "Ethiopia", "Addis Ababa", 8.98, 38.799, "ecatc@ethionet.et", "http://www.ecaa.gov.et", "ECAA training centre. A named academy contact is also published, and that personal mailbox is not stored."),
  school("Saudi Academy of Civil Aviation", "Saudi Arabia", "Jeddah", 21.543, 39.173, "saca.bd@saca.edu.sa", "https://www.saca.edu.sa", "SACA publishes air traffic control courses, including aerodrome and approach surveillance. The business-development mailbox is saca.bd@saca.edu.sa. Simulator vendor was not published."),
  school("Incheon Airport Aviation Academy", "Republic of Korea", "Incheon", 37.449, 126.45, "iaaa@airport.kr", "https://iaaa.airport.kr", "Incheon Airport academy. It publishes aviation training and lists an apron traffic-control simulator. The vendor was not published."),
  school("Korea Airports Corporation Civil Aviation Training Centre", "Republic of Korea", "Cheongju", 36.642, 127.489, "catc_astc@airport.co.kr", "https://www.airport.co.kr", "KAC training centre. It publishes air traffic control courses. A named coordinator mailbox was not stored. Simulator vendor was not published."),
  school("NANSC Training", "Egypt", "Cairo", 30.112, 31.4, "dg.training@nansceg.org", "https://nansceg.net", "NANSC publishes department mailboxes for training, including tower and area control. Named managers are omitted.", {
    extraContacts: [
      { email: "twr.training@nansceg.org", title: "Tower training" },
      { email: "acc.training@nansceg.org", title: "Area training" },
    ],
    simulatorKind: "RADAR_AND_TOWER",
  }),
];
