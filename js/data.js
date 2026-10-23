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
    tips: [['Vent', 'Steam vents shoot out sparks: catch them!'], ['Column', 'Ride the rising rock columns']],
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
    tips: [['Tide', 'Cross the sandbar only at low tide'], ['Rock', 'Wait on the rocks when the tide comes in']],
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
    tips: [['Leaf', 'Catch falling leaves before they land'], ['Branch', 'Bounce on springy branches']],
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
    tips: [['Bird', 'Stand still near a bird to photograph it'], ['Lily', 'Lily pads sink: keep hopping!']],
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
    tips: [['Plant', 'Walk over empty planters to plant trees'], ['Bike', 'Grab a bike to ride faster']],
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
    tips: [['Rain', 'Catch raindrops from the clouds'], ['Wind', 'Ride the updrafts and wind gusts']],
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
    tips: [['Awning', 'Bounce high on the shop awnings'], ['Sign', 'Grab shop signs while they are lit']],
    implication: { title: 'Living in a crowded city', text: 'Tall buildings packed along narrow streets trap heat and traffic fumes, making Mong Kok one of the hottest spots in the city. Planners can help with greenery, wind paths between buildings and better spaces for walking.' },
    items: [
      { key: 'goldfish', name: 'Goldfish Bag', fact: 'Goldfish Street is a market street full of fish shops. Goldfish are a symbol of good luck.' },
      { key: 'neon', name: 'Shop Sign', fact: 'Shops, homes and offices are stacked on top of each other to make the most of very little land.' },
      { key: 'minibus', name: 'Minibus', fact: 'Buses, minibuses and trains move huge crowds of people around the city every day.' }
    ]
  },
  {
    id: 'northern',
    name: 'Northern Metropolis',
    zh: '北部都會區',
    area: 'San Tin',
    theme: 'Planning Future Cities',
    color: '#2F9E8F', dark: '#1D6E63',
    buddy: 'img/buddy_northern.webp',
    bg: 'img/bg_northern.webp',
    style: 'metro',
    blurb: 'Right next to the border with Shenzhen, fish ponds and villages at San Tin are being planned into a brand-new innovation and technology hub, with new homes, jobs and railways. It is the flagship project of the Northern Metropolis.',
    hello: 'Ride the crane hooks across the building site of a future city!',
    tips: [['Hook', 'Touch a crane hook to hang on'], ['Jump', 'Let go of the hook']],
    implication: { title: 'Development and conservation', text: 'Building near the border brings jobs closer to where people live and links Hong Kong with Shenzhen. But some fish ponds will be filled, so a new wetland conservation park is planned to make up for lost habitat for birds.' },
    items: [
      { key: 'chip', name: 'Tech Chip', fact: 'New innovation and technology parks are planned here to work with the tech zone across the river in Shenzhen.' },
      { key: 'fishpond', name: 'Fish Pond', fact: 'Fish ponds here are part of a wetland where many birds feed. A new conservation park will protect and improve them.' },
      { key: 'train', name: 'New Railway', fact: 'New railway lines are planned so people can travel quickly to the rest of Hong Kong and to Shenzhen.' }
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
    tips: [['Belt', 'Ride the baggage belts'], ['Dolphin', 'Watch the water to spot dolphins']],
    implication: { title: 'Connecting with the world', text: 'Flights and cargo make Hong Kong a global hub and support many jobs. But making new land from the sea takes away marine habitats, so new marine parks now protect Chinese white dolphins in nearby waters.' },
    items: [
      { key: 'plane', name: 'Aeroplane', fact: 'Flights link Hong Kong to cities around the world.' },
      { key: 'suitcase', name: 'Cargo & Luggage', fact: 'Air cargo carries goods in and out of Hong Kong, helping trade.' },
      { key: 'dolphin', name: 'Chinese White Dolphin', fact: 'These pink dolphins live in the waters around Lantau. Marine parks help protect them.' }
    ]
  },
  {
    id: 'hzmb',
    name: 'Hong Kong–Zhuhai–Macao Bridge',
    zh: '港珠澳大橋',
    area: 'Lantau waters',
    theme: 'Linking the Region',
    color: '#4A63C9', dark: '#2E4294',
    buddy: 'img/buddy_hzmb.webp',
    bg: 'img/bg_hzmb.webp',
    style: 'bridge',
    icon: 'bridge',
    blurb: 'A giant sea crossing over the Pearl River Estuary that links Hong Kong with Zhuhai and Macao. It is made of long bridges, two artificial islands and an undersea tunnel, so big ships can still sail through.',
    hello: 'Hop on the shuttle buses and dive under the sea to cross the estuary!',
    tips: [['Bus', 'Ride the moving shuttle buses'], ['Dive', 'Swim through the tunnel: tap jump to swim up']],
    implication: { title: 'Linking the Greater Bay Area', text: 'A road link across the estuary makes trips between cities on both sides much quicker, helping people, trade and tourism. Building it in the home of Chinese white dolphins meant fewer bridge piers, ready-made parts and dolphin watchers on the work boats.' },
    items: [
      { key: 'bridge', name: 'Bridge Tower', fact: 'Tall cable-stayed towers hold up the bridge with steel cables, leaving wide gaps for ships below.' },
      { key: 'shuttle', name: 'Shuttle Bus', fact: 'Cross-boundary shuttle buses carry passengers between Hong Kong, Zhuhai and Macao all day and night.' },
      { key: 'ship', name: 'Big Ship', fact: 'Part of the crossing dives under the sea in a tunnel, so the busiest shipping channels stay open for huge ships.' }
    ]
  }
];

window.HOME = { name: 'HKU Geography', zh: '香港大學地理系', note: 'You are here' };
