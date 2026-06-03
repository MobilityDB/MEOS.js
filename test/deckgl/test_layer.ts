import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initMeos } from '../../core/runtime/meos';
import { TGeomPoint } from '../../core/types/basic/tgeompoint/TGeomPoint';
import { tgeompointsToTrips, type Trip } from '../../deckgl/adapter';
import { tripsLayer, tripsLayerFromTGeompoints } from '../../deckgl/layer';

const SEQ =
	'SRID=4326;[POINT(4.35 50.85)@2024-01-15 09:00:00+00, POINT(4.36 50.86)@2024-01-15 09:05:00+00]';

before(async () => {
	await initMeos();
});

describe('tripsLayer (factory over trips)', () => {
	it('wires data and Trip accessors onto a TripsLayer', () => {
		const trips: Trip[] = [
			{
				path: [
					[0, 0],
					[1, 1],
				],
				timestamps: [0, 10],
			},
		];
		const layer = tripsLayer(trips);
		assert.equal(layer.constructor.name, 'TripsLayer');
		assert.equal(layer.props.data, trips);
		// deck.gl types accessors as a value-or-function union; cast to invoke.
		const getPath = layer.props.getPath as (d: Trip) => Trip['path'];
		const getTimestamps = layer.props.getTimestamps as (d: Trip) => Trip['timestamps'];
		assert.deepEqual(getPath(trips[0]), [
			[0, 0],
			[1, 1],
		]);
		assert.deepEqual(getTimestamps(trips[0]), [0, 10]);
	});

	it('accepts a TripCollection and lets props override defaults', () => {
		using t = TGeomPoint.fromString(SEQ);
		const collection = tgeompointsToTrips([t]);
		const layer = tripsLayer(collection, {
			id: 'my-trips',
			currentTime: 120,
			trailLength: 60,
		});
		assert.equal(layer.props.id, 'my-trips');
		assert.equal(layer.props.currentTime, 120);
		assert.equal(layer.props.data, collection.trips);
	});
});

describe('tripsLayerFromTGeompoints (one-call convenience)', () => {
	it('converts temporal points and builds the layer', () => {
		using t = TGeomPoint.fromString(SEQ);
		const layer = tripsLayerFromTGeompoints([t], { id: 'stib' });
		const data = layer.props.data as Trip[];
		assert.equal(layer.props.id, 'stib');
		assert.equal(data.length, 1);
		assert.equal(data[0].path.length, 2);
		assert.deepEqual(data[0].path[0], [4.35, 50.85]);
	});
});
