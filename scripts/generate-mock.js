#!/usr/bin/env node
/**
 * Generate synthetic listings for Findr demos.
 * - No external deps.
 * - Schema matches web/data/listings.json used by the UI.
 * - Adds "source":"mock" provenance flag (UI ignores it, guard can use it).
 *
 * Usage:
 *   node scripts/generate-mock.js           # defaults to 1000
 *   node scripts/generate-mock.js 500       # custom count
 */

const fs = require('fs');
const path = require('path');

const COUNT = Math.max(1, Number(process.argv[2] || 1000));

const CITIES = [
  { name: 'Vancouver',       lat: 49.2827, lon: -123.1207, rkm: 10, price:[650_000, 2_200_000] },
  { name: 'Burnaby',         lat: 49.2488, lon: -122.9805, rkm: 8,  price:[550_000, 1_600_000] },
  { name: 'Richmond',        lat: 49.1666, lon: -123.1336, rkm: 9,  price:[600_000, 1_700_000] },
  { name: 'Surrey',          lat: 49.1913, lon: -122.8490, rkm: 15, price:[500_000, 1_400_000] },
  { name: 'Coquitlam',       lat: 49.2838, lon: -122.7932, rkm: 10, price:[550_000, 1_500_000] },
  { name: 'Port Moody',      lat: 49.2812, lon: -122.8446, rkm: 6,  price:[600_000, 1,600,000] },
  { name: 'Port Coquitlam',  lat: 49.2629, lon: -122.7811, rkm: 7,  price:[520_000, 1_300_000] },
  { name: 'New Westminster', lat: 49.2057, lon: -122.9110, rkm: 6,  price:[520_000, 1_200_000] },
  { name: 'Langley',         lat: 49.1044, lon: -122.6604, rkm: 9,  price:[500_000, 1_200_000] },
  { name: 'Maple Ridge',     lat: 49.2193, lon: -122.5984, rkm: 10, price:[480_000, 1_100_000] }
];

const BROKERAGES = [
  'Example Realty', 'North Shore Real Estate', 'MetroVan Properties',
  'Pacific West Realty', 'Coast Mountain Realty', 'Harbor & Howe Real Estate'
];

const STREET_NAMES = [
  'Main', 'Broadway', 'Granville', 'Cambie', 'Kingsway', 'Hastings', 'Davie', 'Denman',
  'Alberni', 'Burrard', 'Robson', '4th Ave', 'Commercial', 'Lonsdale', 'Marine'
];

const PHOTOS = [
  'https://images.unsplash.com/photo-1507089947368-19c1da9775ae',
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85',
  'https://images.unsplash.com/photo-1460317442991-0ec209397118',
  'https://images.unsplash.com/photo-1504593811423-6dd665756598',
  'https://images.unsplash.com/photo-1494526585095-c41746248156'
];

function rand(seed) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 0xffffffff;
}
const rnd = rand(0xC0FFEE);

function choice(arr) { return arr[Math.floor(rnd() * arr.length)]; }
function randint(min, max) { return Math.floor(rnd() * (max - min + 1)) + min; }
function randfloat(min, max) { return rnd() * (max - min) + min; }

function offsetLatLon(lat, lon, rkm) {
  const kmPerDegLat = 110.574, kmPerDegLon = 111.320 * Math.cos(lat * Math.PI/180);
  const radiusKm = rnd() * rkm;
  const theta = rnd() * 2 * Math.PI;
  const dLat = (radiusKm * Math.cos(theta)) / kmPerDegLat;
  const dLon = (radiusKm * Math.sin(theta)) / kmPerDegLon;
  return [lat + dLat, lon + dLon];
}

function makeAddress() {
  return `${randint(100, 9999)} ${choice(STREET_NAMES)} St`;
}

function makePrice([lo, hi], beds, baths) {
  const base = randfloat(lo, hi);
  const bump = (beds - 2) * 35_000 + (baths - 1) * 20_000;
  return Math.round(Math.max(lo, Math.min(hi, base + bump)) / 1000) * 1000;
}

function makeListing() {
  const city = choice(CITIES);
  const [lat, lon] = offsetLatLon(city.lat, city.lon, city.rkm);
  const beds = randint(1, 5);
  const baths = randint(1, Math.min(4, beds));
  const price = makePrice(city.price, beds, baths);
  return {
    address: makeAddress(),
    city: city.name,
    price,
    beds,
    baths,
    lat: Number(lat.toFixed(6)),
    lon: Number(lon.toFixed(6)),
    brokerage: choice(BROKERAGES),
    realtorca_url: 'https://www.realtor.ca/',
    photo: choice(PHOTOS),
    source: 'mock'
  };
}

function main() {
  const items = Array.from({ length: COUNT }, makeListing);
  const outDir = path.join(process.cwd(), 'web', 'data');
  const outFile = path.join(outDir, 'listings.json');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(items, null, 2));
  console.log(`Wrote ${items.length} listings to ${outFile}`);
}

if (require.main === module) main();
