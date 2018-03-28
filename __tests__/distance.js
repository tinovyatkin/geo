'use strict';

const geolib = require('../');

describe('distance functions', () => {
  test('Testing distance calculation: getDistance()', () => {
    const distance1 = geolib.getDistance(
      { latitude: 52.518611, longitude: 13.408056 },
      { latitude: 51.519475, longitude: 7.46694444 },
    );
    const distance2 = geolib.getDistance(
      { latitude: 52.518611, longitude: 13.408056 },
      { latitude: 51.519475, longitude: 7.46694444 },
      100,
    );
    const distance3 = geolib.getDistance(
      { latitude: 37.774514, longitude: -122.418079 },
      { latitude: 51.519475, longitude: 7.46694444 },
    );
    const distance4 = geolib.getDistance(
      { lat: 41.72977, lng: -111.77621999999997 },
      { lat: 41.73198, lng: -111.77636999999999 },
    );
    const distance5 = geolib.getDistance(
      { lat: 41.72977, lng: -111.77621999999997 },
      { lat: 41.73198, lng: -111.77636999999999 },
      1,
      3,
    );
    const geoJSON = geolib.getDistance(
      [-111.77621999999997, 41.72977],
      [-111.77636999999999, 41.73198],
    );

    expect(distance1).toBe(422592);
    expect(distance2).toBe(422600);
    expect(distance3).toBe(8980260);
    expect(distance4).toBe(246);
    expect(distance5).toBe(245.777);
    expect(geoJSON).toBe(246);
  });
});
