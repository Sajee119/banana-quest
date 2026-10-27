const test = require('node:test');
const assert = require('node:assert');
const { fetchPuzzle } = require('../src/services/banana.service');

test('Banana API returns a valid puzzle', async () => {
    const puzzle = await fetchPuzzle();
    assert.ok(puzzle.imageUrl, 'imageUrl should be present');
    assert.strictEqual(typeof puzzle.solution, 'number');
    assert.ok(!Number.isNaN(puzzle.solution));
});

test('Banana API base64 mode works', async () => {
    const puzzle = await fetchPuzzle({ base64: true });
    assert.ok(puzzle.imageBase64, 'base64 image should be present');
});