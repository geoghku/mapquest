/* Map Quest Hong Kong — site content.
   Locations confirmed on Google Maps (Oct 2026). Text is kept qualitative on purpose (no figures). */
window.SITES = [
  {
    id: 'highisland',
    name: 'High Island East Dam',
    zh: '萬宜水庫東壩',
    area: 'Sai Kung',
    theme: 'Rocks & Volcanoes',
    color: '#F07F3C', dark: '#B4521C',
    buddy: 'img/buddy_rocks.webp',
    bg: 'img/bg_highisland.webp',
    style: 'columns',
    blurb: 'When this dam was built, workers uncovered huge walls of six-sided rock columns. They formed long ago, when thick volcanic material from an ancient supervolcano cooled and cracked. Today it is a highlight of the Hong Kong UNESCO Global Geopark.',
    hello: 'Hop across the rock columns and dig up some volcanic treasures!',
    implication: { title: 'Protecting rare rocks', text: 'Rock columns like these are rare and cannot be replaced. Popular geosites have to balance visitors with protection: no climbing, no taking rocks, and take your litter home.' },
    items: [
      { key: 'hexcol', name: 'Hexagon Column', fact: 'Thick volcanic material cooled and shrank, cracking into tall six-sided columns.' },
      { key: 'ember', name: 'Volcano Spark', fact: 'These rocks come from an ancient supervolcano that once erupted in this area.' },
      { key: 'seacave', name: 'Sea Cave', fact: 'Waves wear away weaker rock along the coast, carving out caves and sea stacks.' }
    ]
  },
  {
    id: 'sharpisland',
    name: 'Sharp Island',
    zh: '橋咀洲',
    area: 'Sai Kung',
    theme: 'Coasts & Tides',
    color: '#1FAFC4', dark: '#137E8E',
    buddy: 'img/buddy_coast.webp',
    bg: 'img/bg_sharpisland.webp',
    style: 'sandbar',
    blurb: 'At low tide a natural bar of sand and gravel appears, linking Sharp Island to the little islet of Kiu Tau. Waves and wind built this tombolo. Look out for the round “pineapple bun” rocks on the beach!',
    hello: 'The tide is out! Cross the sandbar before the waves come back.',
    implication: { title: 'A coast that changes', text: 'Tides and waves keep reshaping the tombolo, and crowds can trample its fragile rocks and nearby corals. Careful visitor management helps keep this coast for the future.' },
    items: [
      { key: 'pebble', name: 'Sand & Gravel', fact: 'Waves and wind carried sand and gravel here, slowly building the tombolo.' },
      { key: 'shell', name: 'Seashell', fact: 'Shells and broken coral get mixed into the sand along the bar.' },
      { key: 'bunrock', name: 'Pineapple Bun Rock', fact: 'Weathering cracked these boulders into a pattern like Hong Kong’s famous bakery bun.' }
    ]
  },
  {
    id: 'taipokau',
    name: 'Tai Po Kau Nature Reserve',
    zh: '大埔滘自然護理區',
    area: 'Tai Po',
    theme: 'Forests & Wildlife',
    color: '#3FA34D', dark: '#2A7535',
    buddy: 'img/buddy_forest.webp',
    bg: 'img/bg_taipokau.webp',
    style: 'forest',
    blurb: 'One of Hong Kong’s most mature forests, full of many kinds of trees, clear hill streams, forest birds and butterflies. A great place to see how a woodland ecosystem fits together.',
    hello: 'Jump from branch to branch and spot the forest’s wildlife!',
    implication: { title: 'Why forests matter', text: 'These hills were once almost bare. Replanting shows how forests can return, holding soil on steep slopes, protecting streams that feed our reservoirs and giving wildlife a home.' },
    items: [
      { key: 'leaf', name: 'Forest Leaf', fact: 'Many kinds of trees grow together here, making a rich, layered forest.' },
      { key: 'butterfly', name: 'Butterfly', fact: 'The reserve is a favourite place for butterfly watching.' },
      { key: 'bird', name: 'Forest Bird', fact: 'Birdwatchers come here to look for forest birds high in the branches.' }
    ]
  },
  {
    id: 'longvalley',
    name: 'Long Valley Nature Park',
    zh: '塱原自然公園',
    area: 'Sheung Shui',
    theme: 'Wetlands & Farming',
    color: '#E6A817', dark: '#A8770B',
    buddy: 'img/buddy_farm.webp',
    bg: 'img/bg_longvalley.webp',
    style: 'wetland',
    blurb: 'Hong Kong’s largest freshwater wetland: a patchwork of wet fields, ponds and marshes. Here farming and nature conservation work side by side, giving water birds and migrating birds a place to feed and rest.',
    hello: 'Hop along the field paths and help the farm and the birds!',
    implication: { title: 'Development and nature together', text: 'As new towns grow nearby, this wetland was kept and improved as a nature park. It shows that building homes and protecting habitats can be planned side by side.' },
    items: [
      { key: 'rice', name: 'Rice Stalk', fact: 'Wet paddy fields give birds food and shelter on their long migrations.' },
      { key: 'veg', name: 'Fresh Vegetable', fact: 'Farmers here grow crops in eco-friendly ways, without harmful sprays.' },
      { key: 'egret', name: 'Water Bird', fact: 'Ponds and marshes make this wetland a home for many water birds.' }
    ]
  },
  {
    id: 'kaitak',
    name: 'Kai Tak',
    zh: '啟德',
    area: 'Kowloon',
    theme: 'Cities & Sustainability',
    color: '#E8547A', dark: '#A8324F',
    buddy: 'img/buddy_city.webp',
    bg: 'img/bg_kaitak.webp',
    style: 'city',
    blurb: 'Planes once landed here! The old airport is becoming a new district with a sports park, a cruise terminal, waterfront parks and green buildings: a big example of planning a greener city.',
    hello: 'Race along the old runway and collect ideas for a greener city!',
    implication: { title: 'Reusing city land', text: 'Reusing old land, rather than building on countryside, helps a crowded city grow. A shared seawater cooling system here uses less electricity than separate air-conditioners in every building.' },
    items: [
      { key: 'tree', name: 'Street Tree', fact: 'The old airport site now has parks, gardens and a leafy waterfront.' },
      { key: 'bike', name: 'Bicycle', fact: 'Cycle tracks and walkways help people get around without cars.' },
      { key: 'solar', name: 'Solar Panel', fact: 'New buildings here use green ideas such as solar panels and rooftop gardens.' }
    ]
  },
  {
    id: 'observatory',
    name: 'Hong Kong Observatory',
    zh: '香港天文台',
    area: 'Tsim Sha Tsui',
    theme: 'Weather & Climate',
    color: '#7A5CDB', dark: '#523AA6',
    buddy: 'img/buddy_weather.webp',
    bg: 'img/bg_observatory.webp',
    style: 'sky',
    blurb: 'On this leafy hill, weather has been watched and recorded for a very long time. These long-term records help scientists understand how Hong Kong’s climate is changing, and the Observatory forecasts the weather and warns us about storms.',
    hello: 'Bounce across the clouds and gather the weather clues!',
    implication: { title: 'Getting ready for a warmer future', text: 'Records show a warming trend, with more very hot days and heavier rainstorms expected. Hong Kong needs to adapt with better drainage, early warnings and cooler, greener streets.' },
    items: [
      { key: 'thermo', name: 'Thermometer', fact: 'Long-term temperature records help scientists track a warming climate.' },
      { key: 'rain', name: 'Raindrop', fact: 'Rain measurements help forecasters warn people about heavy rainstorms.' },
      { key: 'vane', name: 'Wind Vane', fact: 'Instruments measure wind, rain and temperature to forecast the weather.' }
    ]
  },
  {
    id: 'mongkok',
    name: 'Mong Kok',
    zh: '旺角',
    area: 'Kowloon',
    theme: 'Busy City Streets',
    color: '#F2508F', dark: '#B02A63',
    buddy: 'img/buddy_street.webp',
    bg: 'img/bg_mongkok.webp',
    style: 'street',
    blurb: 'One of the most crowded places on Earth! Tall, narrow buildings line busy streets full of shops, street markets and people. Some streets even specialise, like Goldfish Street, where fish hang in bags outside the shops.',
    hello: 'Dash along the busy streets and hop over the market stalls!',
    implication: { title: 'Living in a crowded city', text: 'Tall buildings packed along narrow streets trap heat and traffic fumes, making Mong Kok one of the hottest spots in the city. Planners can help with greenery, wind paths between buildings and better spaces for walking.' },
    items: [
      { key: 'goldfish', name: 'Goldfish Bag', fact: 'Goldfish Street is a market street full of fish shops. Goldfish are a symbol of good luck.' },
      { key: 'neon', name: 'Shop Sign', fact: 'Shops, homes and offices are stacked on top of each other to make the most of very little land.' },
      { key: 'minibus', name: 'Minibus', fact: 'Buses, minibuses and trains move huge crowds of people around the city every day.' }
    ]
  },
  {
    id: 'shatin',
    name: 'Sha Tin New Town',
    zh: '沙田新市鎮',
    area: 'Sha Tin',
    theme: 'New Towns',
    color: '#2F9E8F', dark: '#1D6E63',
    buddy: 'img/buddy_newtown.webp',
    bg: 'img/bg_shatin.webp',
    style: 'newtown',
    blurb: 'Sha Tin was once a quiet bay with villages and farmland. It was turned into a planned new town on land reclaimed from the sea, with housing estates, shopping centres, parks and train links. The Shing Mun River runs straight through the middle.',
    hello: 'Zoom along the riverside and explore a planned new town!',
    implication: { title: 'Planning a whole town', text: 'New towns give people more space away from the crowded city centre. But many residents still travel to the urban area for work, so good rail and road links are key. The river channel also helps carry away floodwater.' },
    items: [
      { key: 'estate', name: 'Housing Estate', fact: 'Planned estates gave families new homes, with schools, shops and parks close by.' },
      { key: 'train', name: 'Train', fact: 'The railway links Sha Tin to Kowloon, so people can get to work and school quickly.' },
      { key: 'dragonboat', name: 'Dragon Boat', fact: 'The Shing Mun River was built as a wide, straight channel. Now people row and race dragon boats on it.' }
    ]
  },
  {
    id: 'airport',
    name: 'Hong Kong International Airport',
    zh: '香港國際機場',
    area: 'Chek Lap Kok',
    theme: 'Transport & Connections',
    color: '#3D7BE0', dark: '#2453A3',
    buddy: 'img/buddy_airport.webp',
    bg: 'img/bg_airport.webp',
    style: 'airport',
    blurb: 'The airport sits on a huge flat island made by levelling two small hilly islands and filling in the sea around them. It connects Hong Kong with cities all over the world, for people and for goods.',
    hello: 'Hop across the airport island before your flight takes off!',
    implication: { title: 'Connecting with the world', text: 'Flights and cargo make Hong Kong a global hub and support many jobs. But making new land from the sea takes away marine habitats, so new marine parks now protect Chinese white dolphins in nearby waters.' },
    items: [
      { key: 'plane', name: 'Aeroplane', fact: 'Flights link Hong Kong to cities around the world.' },
      { key: 'suitcase', name: 'Cargo & Luggage', fact: 'Air cargo carries goods in and out of Hong Kong, helping trade.' },
      { key: 'dolphin', name: 'Chinese White Dolphin', fact: 'These pink dolphins live in the waters around Lantau. Marine parks help protect them.' }
    ]
  }
];

window.HOME = { name: 'HKU Geography', zh: '香港大學地理系', note: 'You are here' };
