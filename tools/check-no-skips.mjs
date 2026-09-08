#!/usr/bin/env node
// Refuse every construct that stops a test asserting while the run still reports
// success.
//
// `node --test` offers two: the `skip` option and the `todo` option, in an
// object literal beside the test name, and the `.skip` / `.todo` property forms
// on `test`, `it` and `describe`. Node prints a deferred test with a TICK, so
// both read as a pass to anyone scanning the output.
//
// The floor and the skip count in the workflow catch a skip at RUN time. This
// catches it at WRITE time, which is the difference between a rule someone has
// to remember and one they cannot get past: `npm run check:no-skips` fails
// locally exactly as it fails in CI.
//
// Deleting a test remains the one way to stop running it, and that leaves no
// skip behind — which is what the workflow's test-count floor is for.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Each pattern names one way to stop a test running. The message is what the
// author sees, so it says what to do instead rather than only what is refused.
const BANNED = [
	[/\bskip\s*:/, 'the `skip` option'],
	[/\btodo\s*:/, 'the `todo` option'],
	[/\b(test|it|describe)\s*\.\s*skip\b/, '`.skip`'],
	[/\b(test|it|describe)\s*\.\s*todo\b/, '`.todo`'],
	[/\bt\s*\.\s*skip\s*\(/, '`t.skip()`'],
];

const ROOT = new URL('..', import.meta.url).pathname;
const TESTS = join(ROOT, 'test');

function* sources(dir) {
	for (const entry of readdirSync(dir)) {
		const path = join(dir, entry);
		if (statSync(path).isDirectory()) yield* sources(path);
		else if (path.endsWith('.ts') || path.endsWith('.js')) yield path;
	}
}

let read = 0;
const found = [];
for (const path of sources(TESTS)) {
	read += 1;
	const lines = readFileSync(path, 'utf8').split('\n');
	lines.forEach((line, i) => {
		// A line that is only a comment describes a construct rather than using
		// one; the prose above this file's own patterns would otherwise trip it.
		if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
		for (const [pattern, what] of BANNED) {
			if (pattern.test(line)) {
				found.push(`${path.slice(ROOT.length)}:${i + 1}: ${what}: ${line.trim()}`);
			}
		}
	});
}

// A run that read no file proves nothing about the tree, so it fails rather than
// reporting a clean result over an empty search.
if (read === 0) {
	console.error('check-no-skips: no test source was read — check the path');
	process.exit(2);
}

for (const hit of found) console.error(hit);
console.log(`check-no-skips: ${read} test source(s) read, ${found.length} skip construct(s)`);
if (found.length) {
	console.error(
		'::error::a skipped test asserts nothing and reads as a pass. Supply the ' +
		'precondition the guard waits for, or delete the test — the suite carries ' +
		'no skips.');
	process.exit(1);
}
