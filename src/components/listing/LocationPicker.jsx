import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Country → States/Provinces → Major Cities
const LOCATION_DATA = {
  "United States": {
    "Alabama": ["Birmingham", "Montgomery", "Huntsville", "Mobile"],
    "Alaska": ["Anchorage", "Fairbanks", "Juneau"],
    "Arizona": ["Phoenix", "Tucson", "Scottsdale", "Mesa", "Tempe"],
    "Arkansas": ["Little Rock", "Fort Smith", "Fayetteville"],
    "California": ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "San Jose", "Oakland", "Santa Barbara", "Palm Springs", "Malibu", "Beverly Hills", "Napa", "Carmel"],
    "Colorado": ["Denver", "Boulder", "Colorado Springs", "Aspen", "Vail"],
    "Connecticut": ["Hartford", "New Haven", "Stamford", "Greenwich", "Westport"],
    "Delaware": ["Wilmington", "Dover", "Newark"],
    "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale", "Palm Beach", "Naples", "Sarasota", "Boca Raton", "Key West"],
    "Georgia": ["Atlanta", "Savannah", "Augusta", "Columbus"],
    "Hawaii": ["Honolulu", "Maui", "Kauai", "Hilo"],
    "Idaho": ["Boise", "Nampa", "Meridian"],
    "Illinois": ["Chicago", "Evanston", "Naperville", "Springfield", "Rockford"],
    "Indiana": ["Indianapolis", "Fort Wayne", "South Bend", "Bloomington"],
    "Iowa": ["Des Moines", "Cedar Rapids", "Iowa City"],
    "Kansas": ["Wichita", "Overland Park", "Kansas City"],
    "Kentucky": ["Louisville", "Lexington", "Bowling Green"],
    "Louisiana": ["New Orleans", "Baton Rouge", "Shreveport"],
    "Maine": ["Portland", "Augusta", "Bangor"],
    "Maryland": ["Baltimore", "Annapolis", "Bethesda", "Rockville"],
    "Massachusetts": ["Boston", "Cambridge", "Worcester", "Springfield", "Salem", "Concord", "Provincetown"],
    "Michigan": ["Detroit", "Ann Arbor", "Grand Rapids", "Lansing", "Traverse City"],
    "Minnesota": ["Minneapolis", "Saint Paul", "Rochester", "Duluth"],
    "Mississippi": ["Jackson", "Biloxi", "Gulfport"],
    "Missouri": ["Kansas City", "St. Louis", "Springfield", "Columbia"],
    "Montana": ["Billings", "Missoula", "Bozeman", "Helena"],
    "Nebraska": ["Omaha", "Lincoln", "Bellevue"],
    "Nevada": ["Las Vegas", "Reno", "Henderson", "Carson City"],
    "New Hampshire": ["Manchester", "Nashua", "Concord", "Portsmouth"],
    "New Jersey": ["Newark", "Jersey City", "Princeton", "Atlantic City", "Hoboken"],
    "New Mexico": ["Albuquerque", "Santa Fe", "Las Cruces", "Taos"],
    "New York": ["New York City", "Brooklyn", "Queens", "Manhattan", "Buffalo", "Albany", "Rochester", "Syracuse", "Ithaca", "Hudson", "Catskill", "Kingston", "Woodstock", "The Hamptons", "Montauk"],
    "North Carolina": ["Charlotte", "Raleigh", "Durham", "Asheville", "Chapel Hill"],
    "North Dakota": ["Fargo", "Bismarck", "Grand Forks"],
    "Ohio": ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron"],
    "Oklahoma": ["Oklahoma City", "Tulsa", "Norman"],
    "Oregon": ["Portland", "Eugene", "Salem", "Bend", "Ashland"],
    "Pennsylvania": ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Lancaster", "New Hope"],
    "Rhode Island": ["Providence", "Newport", "Warwick"],
    "South Carolina": ["Charleston", "Columbia", "Greenville", "Hilton Head"],
    "South Dakota": ["Sioux Falls", "Rapid City", "Pierre"],
    "Tennessee": ["Nashville", "Memphis", "Knoxville", "Chattanooga"],
    "Texas": ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth", "El Paso", "Galveston", "Marfa"],
    "Utah": ["Salt Lake City", "Provo", "Ogden", "Park City"],
    "Vermont": ["Burlington", "Montpelier", "Stowe", "Brattleboro", "Woodstock"],
    "Virginia": ["Richmond", "Virginia Beach", "Norfolk", "Alexandria", "Arlington"],
    "Washington": ["Seattle", "Spokane", "Tacoma", "Bellevue", "Olympia"],
    "West Virginia": ["Charleston", "Huntington", "Morgantown"],
    "Wisconsin": ["Milwaukee", "Madison", "Green Bay", "Kenosha"],
    "Wyoming": ["Cheyenne", "Casper", "Laramie", "Jackson"],
  },
  "Canada": {
    "Alberta": ["Calgary", "Edmonton", "Lethbridge", "Red Deer"],
    "British Columbia": ["Vancouver", "Victoria", "Kelowna", "Surrey"],
    "Manitoba": ["Winnipeg", "Brandon", "Steinbach"],
    "New Brunswick": ["Moncton", "Saint John", "Fredericton"],
    "Newfoundland and Labrador": ["St. John's", "Corner Brook"],
    "Nova Scotia": ["Halifax", "Sydney", "Truro"],
    "Ontario": ["Toronto", "Ottawa", "Mississauga", "Hamilton", "London", "Kingston"],
    "Prince Edward Island": ["Charlottetown", "Summerside"],
    "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau"],
    "Saskatchewan": ["Saskatoon", "Regina", "Prince Albert"],
  },
  "United Kingdom": {
    "England": ["London", "Manchester", "Birmingham", "Leeds", "Liverpool", "Bristol", "Sheffield", "Newcastle", "Bath", "Oxford", "Cambridge", "Brighton", "Exeter"],
    "Scotland": ["Edinburgh", "Glasgow", "Aberdeen", "Dundee", "Inverness"],
    "Wales": ["Cardiff", "Swansea", "Newport", "St. Davids"],
    "Northern Ireland": ["Belfast", "Derry", "Lisburn"],
  },
  "France": {
    "Île-de-France": ["Paris", "Versailles", "Saint-Denis", "Boulogne-Billancourt"],
    "Provence-Alpes-Côte d'Azur": ["Marseille", "Nice", "Cannes", "Aix-en-Provence", "Antibes"],
    "Auvergne-Rhône-Alpes": ["Lyon", "Grenoble", "Clermont-Ferrand"],
    "Nouvelle-Aquitaine": ["Bordeaux", "Biarritz", "Limoges", "Périgueux"],
    "Occitanie": ["Toulouse", "Montpellier", "Nîmes"],
    "Bretagne": ["Rennes", "Brest", "Saint-Malo"],
    "Normandie": ["Rouen", "Caen", "Le Havre"],
  },
  "Germany": {
    "Bavaria": ["Munich", "Nuremberg", "Augsburg", "Regensburg"],
    "Berlin": ["Berlin"],
    "Hamburg": ["Hamburg"],
    "Hesse": ["Frankfurt", "Wiesbaden", "Kassel"],
    "North Rhine-Westphalia": ["Cologne", "Düsseldorf", "Dortmund", "Essen"],
    "Baden-Württemberg": ["Stuttgart", "Heidelberg", "Karlsruhe", "Freiburg"],
    "Saxony": ["Dresden", "Leipzig", "Chemnitz"],
  },
  "Italy": {
    "Lombardy": ["Milan", "Bergamo", "Brescia", "Como"],
    "Tuscany": ["Florence", "Siena", "Pisa", "Lucca", "Arezzo"],
    "Lazio": ["Rome", "Tivoli", "Viterbo"],
    "Veneto": ["Venice", "Verona", "Padua", "Treviso"],
    "Campania": ["Naples", "Pompeii", "Positano", "Amalfi"],
    "Sicily": ["Palermo", "Catania", "Syracuse", "Taormina"],
    "Piedmont": ["Turin", "Asti", "Alba"],
    "Emilia-Romagna": ["Bologna", "Parma", "Modena", "Ferrara"],
  },
  "Spain": {
    "Catalonia": ["Barcelona", "Girona", "Tarragona"],
    "Madrid": ["Madrid"],
    "Andalusia": ["Seville", "Granada", "Málaga", "Córdoba"],
    "Valencia": ["Valencia", "Alicante", "Castellón"],
    "Basque Country": ["Bilbao", "San Sebastián", "Vitoria"],
    "Balearic Islands": ["Palma", "Ibiza", "Menorca"],
  },
  "Switzerland": {
    "Zurich": ["Zurich", "Winterthur"],
    "Geneva": ["Geneva"],
    "Bern": ["Bern"],
    "Basel-City": ["Basel"],
    "Lucerne": ["Lucerne"],
    "Graubünden": ["St. Moritz", "Davos", "Chur"],
    "Valais": ["Zermatt", "Sion"],
  },
  "Netherlands": {
    "North Holland": ["Amsterdam", "Haarlem", "Zaandam"],
    "South Holland": ["Rotterdam", "The Hague", "Leiden", "Delft"],
    "Utrecht": ["Utrecht", "Amersfoort"],
    "Gelderland": ["Arnhem", "Nijmegen"],
  },
  "Belgium": {
    "Brussels": ["Brussels"],
    "Flanders": ["Antwerp", "Ghent", "Bruges", "Leuven"],
    "Wallonia": ["Liège", "Namur", "Mons"],
  },
  "Austria": {
    "Vienna": ["Vienna"],
    "Salzburg": ["Salzburg", "Hallstatt"],
    "Tyrol": ["Innsbruck", "Kitzbühel"],
    "Styria": ["Graz"],
    "Upper Austria": ["Linz", "Wels"],
  },
  "Japan": {
    "Tokyo": ["Tokyo", "Shibuya", "Shinjuku", "Ginza"],
    "Osaka": ["Osaka", "Sakai"],
    "Kyoto": ["Kyoto", "Uji"],
    "Kanagawa": ["Yokohama", "Kamakura"],
    "Hokkaido": ["Sapporo", "Hakodate"],
    "Aichi": ["Nagoya"],
  },
  "Australia": {
    "New South Wales": ["Sydney", "Newcastle", "Wollongong", "Blue Mountains"],
    "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo"],
    "Queensland": ["Brisbane", "Gold Coast", "Cairns", "Townsville"],
    "Western Australia": ["Perth", "Fremantle", "Broome"],
    "South Australia": ["Adelaide", "Barossa Valley"],
    "Tasmania": ["Hobart", "Launceston"],
  },
  "Hungary": {
    "Budapest": ["Budapest"],
    "Pest": ["Debrecen", "Miskolc", "Nyíregyháza", "Kecskemét"],
    "Győr-Moson-Sopron": ["Győr", "Sopron"],
    "Baranya": ["Pécs"],
    "Csongrád-Csanád": ["Szeged"],
  },
  "Poland": {
    "Masovian": ["Warsaw", "Radom"],
    "Lesser Poland": ["Kraków", "Tarnów"],
    "Silesian": ["Katowice", "Wrocław", "Częstochowa"],
    "Greater Poland": ["Poznań", "Kalisz"],
    "Pomeranian": ["Gdańsk", "Gdynia", "Sopot"],
  },
  "Czech Republic": {
    "Prague": ["Prague"],
    "South Moravian": ["Brno"],
    "Moravian-Silesian": ["Ostrava"],
    "Karlovy Vary": ["Karlovy Vary"],
  },
  "Israel": {
    "Tel Aviv District": ["Tel Aviv", "Jaffa", "Ramat Gan"],
    "Jerusalem District": ["Jerusalem"],
    "Haifa District": ["Haifa"],
    "Northern District": ["Nazareth", "Tiberias", "Safed"],
  },
  "China": {
    "Beijing": ["Beijing"],
    "Shanghai": ["Shanghai"],
    "Guangdong": ["Guangzhou", "Shenzhen", "Dongguan"],
    "Zhejiang": ["Hangzhou", "Ningbo"],
    "Jiangsu": ["Nanjing", "Suzhou"],
    "Sichuan": ["Chengdu"],
  },
  "Hong Kong": {
    "Hong Kong Island": ["Central", "Wan Chai", "Causeway Bay"],
    "Kowloon": ["Tsim Sha Tsui", "Mong Kok"],
    "New Territories": ["Sha Tin", "Tuen Mun"],
  },
  "Singapore": {
    "Central Region": ["Singapore City", "Orchard", "Marina Bay"],
    "East Region": ["Tampines", "Bedok"],
    "West Region": ["Jurong", "Clementi"],
  },
  "India": {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
    "Delhi": ["New Delhi", "Delhi"],
    "Karnataka": ["Bangalore", "Mysore"],
    "Tamil Nadu": ["Chennai", "Coimbatore"],
    "West Bengal": ["Kolkata"],
    "Rajasthan": ["Jaipur", "Udaipur", "Jodhpur"],
    "Uttar Pradesh": ["Agra", "Varanasi", "Lucknow"],
  },
  "Brazil": {
    "São Paulo": ["São Paulo", "Campinas", "Santos"],
    "Rio de Janeiro": ["Rio de Janeiro", "Niterói"],
    "Minas Gerais": ["Belo Horizonte", "Ouro Preto"],
    "Bahia": ["Salvador"],
  },
  "Mexico": {
    "Mexico City": ["Mexico City"],
    "Jalisco": ["Guadalajara", "Puerto Vallarta"],
    "Quintana Roo": ["Cancún", "Playa del Carmen", "Tulum"],
    "Oaxaca": ["Oaxaca City", "Puerto Escondido"],
    "Yucatán": ["Mérida"],
  },
  "South Africa": {
    "Western Cape": ["Cape Town", "Stellenbosch", "Franschhoek"],
    "Gauteng": ["Johannesburg", "Pretoria"],
    "KwaZulu-Natal": ["Durban", "Pietermaritzburg"],
  },
};

const selectClass = "w-full h-11 border-0 border-b border-neutral-200 bg-transparent text-base text-neutral-800 focus:outline-none focus:border-neutral-700 transition-colors duration-200 appearance-none cursor-pointer pr-6";

export default function LocationPicker({ value, onChange, className }) {
  const COUNTRIES = Object.keys(LOCATION_DATA).sort();

  // Parse existing value back into parts
  const parseValue = (val) => {
    if (!val) return { country: "", state: "", city: "" };
    const parts = val.split(", ").map(s => s.trim());
    if (parts.length === 3) return { city: parts[0], state: parts[1], country: parts[2] };
    if (parts.length === 2) {
      // Could be "City, Country" or "State, Country"
      const [a, b] = parts;
      if (LOCATION_DATA[b]) return { city: "", state: a, country: b };
      return { city: a, state: "", country: b };
    }
    if (parts.length === 1 && LOCATION_DATA[parts[0]]) return { city: "", state: "", country: parts[0] };
    return { country: "", state: "", city: "" };
  };

  const parsed = parseValue(value);
  const [country, setCountry] = useState(parsed.country);
  const [state, setState] = useState(parsed.state);
  const [city, setCity] = useState(parsed.city);

  // Sync if value changes externally
  useEffect(() => {
    const p = parseValue(value);
    setCountry(p.country);
    setState(p.state);
    setCity(p.city);
  }, []);

  const states = country ? Object.keys(LOCATION_DATA[country] || {}).sort() : [];
  const cities = (country && state) ? (LOCATION_DATA[country]?.[state] || []).sort() : [];

  const buildValue = (c, s, ci) => {
    const parts = [ci, s, c].filter(Boolean);
    return parts.join(", ");
  };

  const handleCountry = (c) => {
    setCountry(c); setState(""); setCity("");
    onChange(c);
  };

  const handleState = (s) => {
    setState(s); setCity("");
    onChange(buildValue(country, s, ""));
  };

  const handleCity = (ci) => {
    setCity(ci);
    onChange(buildValue(country, state, ci));
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <select
          value={country}
          onChange={e => handleCountry(e.target.value)}
          className={selectClass}
        >
          <option value="">Select country…</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {country && states.length > 0 && (
        <div className="relative">
          <select
            value={state}
            onChange={e => handleState(e.target.value)}
            className={selectClass}
          >
            <option value="">Select state / province / region…</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {state && (
        <div className="relative">
          <input
            type="text"
            placeholder="Enter city…"
            value={city}
            onChange={e => handleCity(e.target.value)}
            list="city-suggestions"
            className={selectClass}
          />
          {cities.length > 0 && (
            <datalist id="city-suggestions">
              {cities.map(c => <option key={c} value={c} />)}
            </datalist>
          )}
        </div>
      )}

      {value && (
        <p className="text-xs text-neutral-400">
          Displays as: <span className="text-neutral-600 font-medium">{value}</span>
        </p>
      )}
    </div>
  );
}