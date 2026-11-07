import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('security.txt has a contact and has not expired (renew a month ahead)', async () => {
  const text = await readFile(new URL('../../site/.well-known/security.txt', import.meta.url), 'utf8');
  assert.match(text, /^Contact: https:\/\//m);
  const expires = new Date(text.match(/^Expires: (.+)$/m)[1]);
  const aMonthFromNow = Date.now() + 30 * 24 * 60 * 60 * 1000;
  assert.ok(expires.getTime() > aMonthFromNow, `security.txt expires ${expires.toISOString()}; bump it`);
});
