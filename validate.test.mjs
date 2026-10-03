import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
test('delivered files match pinned manifests and image headers', () => {
 if (!existsSync('deliveries')) return;
 for (const worker of readdirSync('deliveries')) for (const task of readdirSync('deliveries/'+worker)) {
  const base='deliveries/'+worker+'/'+task;
  const manifest=JSON.parse(readFileSync(base+'/manifest.json','utf8'));
  assert.match(manifest.name,/^[a-z0-9_-]+\.(png|jpg|jpeg|txt|md|json)$/);
  const bytes=readFileSync(base+'/'+manifest.name);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.sha256);
  assert.ok(bytes.length>15 && bytes.length<=20*1024*1024);
  if(manifest.mediaType==='image/png') {
   assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
   assert.ok(bytes.readUInt32BE(16)>0 && bytes.readUInt32BE(20)>0);
  }
  if(manifest.mediaType==='image/jpeg') assert.equal(bytes.subarray(0,3).toString('hex'),'ffd8ff');
  if(manifest.mediaType==='application/json') JSON.parse(bytes.toString());
 }
});
