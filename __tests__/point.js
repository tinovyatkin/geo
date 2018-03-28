'use strict';

const geo = require('../');

describe('point format conversion', () => {
  test('latitude', () => {
    expect(geo.latitude([1, 2, 3])).toBe(2);
    expect(geo.latitude({ lat: 2, lng: 3 })).toBe(2);
    expect(geo.latitude({ latitude: 2, longitude: 3 })).toBe(2);
  });

  test('longitude', () => {
    expect(geo.longitude([1, 2, 3])).toBe(1);
    expect(geo.longitude({ lat: 2, lng: 3 })).toBe(3);
    expect(geo.longitude({ latitude: 2, longitude: 3 })).toBe(3);
  });
});
