/**
 * Mock live-timing data fixture.
 * Replace with real scraper output during race weekends.
 */
export const MOCK_TIMING = [
  { pos: 1,  car: '99',  team: 'ROWE Racing',          driver: 'Catsburg / Eng / Fosse',      class: 'GT3', gap: 'LEADER', lastLap: '8:12.341', bestLap: '8:10.982', tyre: 'S', laps: 48, status: 'racing' },
  { pos: 2,  car: '4',   team: 'Rutronik Racing',       driver: 'Otto / Olsen / Kern',         class: 'GT3', gap: '+0:23.5', lastLap: '8:13.012', bestLap: '8:11.234', tyre: 'M', laps: 48, status: 'racing' },
  { pos: 3,  car: '3',   team: 'Manthey EMA',           driver: 'Müller / Campbell / Vanthoor',class: 'GT3', gap: '+0:41.2', lastLap: '8:14.556', bestLap: '8:12.001', tyre: 'S', laps: 47, status: 'racing' },
  { pos: 4,  car: '12',  team: 'Walkenhorst Motorsport',driver: 'Hesse / Catsburg / Klingmann',class: 'GT3', gap: '+1:02.8', lastLap: '8:15.102', bestLap: '8:12.445', tyre: 'M', laps: 47, status: 'racing' },
  { pos: 5,  car: '911', team: 'Manthey PureRacing',    driver: 'Christensen / Lietz / Estre', class: 'GT3', gap: '+1:34.0', lastLap: '8:16.778', bestLap: '8:13.100', tyre: 'H', laps: 47, status: 'racing' },
  { pos: 6,  car: '31',  team: 'Frikadelli Racing',     driver: 'Abbelen / Rieger / Siedler',  class: 'GT3', gap: '+2:01.3', lastLap: '8:17.223', bestLap: '8:14.567', tyre: 'S', laps: 46, status: 'pit'    },
  { pos: 7,  car: '10',  team: 'Lionspeed by Car Collection', driver: 'Haase / Hansson / ...',class: 'GT3', gap: '+2:15.9', lastLap: '8:18.009', bestLap: '8:14.890', tyre: 'M', laps: 46, status: 'racing' },
  { pos: 8,  car: '8',   team: 'Toksport WRT',          driver: 'Buhk / Schiller / Olsen',    class: 'GT3', gap: '+2:44.1', lastLap: '8:19.334', bestLap: '8:15.222', tyre: 'H', laps: 46, status: 'racing' },
  { pos: 9,  car: '44',  team: 'Allied-Racing',         driver: 'Heinemann / Müller / Daalder',class: 'GT4', gap: '+3 laps', lastLap: '8:45.667', bestLap: '8:43.001', tyre: 'M', laps: 45, status: 'racing' },
  { pos: 10, car: '77',  team: 'Black Falcon',          driver: 'Palttala / Stolz / Jäger',   class: 'GT4', gap: '+3 laps', lastLap: '8:48.223', bestLap: '8:44.567', tyre: 'S', laps: 44, status: 'racing' },
];

export const MOCK_TELEMETRY = {
  speed: 267,        // km/h
  gear: 5,
  rpm: 7840,
  throttle: 88,      // %
  brake: 0,          // %
  steeringAngle: -4, // degrees
  tyreTempFL: 92,    // °C
  tyreTempFR: 89,
  tyreTempRL: 87,
  tyreTempRR: 85,
  fuelLoad: 64.2,    // litres
  lapTime: '2:41.3',
  sector: 2,
};

export const SESSION_INFO = {
  name: 'ADAC TOTAL 24h-Rennen Nürburgring',
  session: 'RACE',
  elapsed: '04:27:13',
  remaining: '19:32:47',
  flag: 'GREEN',
  weather: 'DRY',
  trackTemp: 28,
  airTemp: 16,
};
