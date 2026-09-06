const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../core.js');

test('TXT UTF-8/CRLF preserves multiline style and Suno syntax',()=>{
  const p=C.parse('\uFEFFTITLE: Test Track\r\nVERSION: V02\r\nVOICE: Test Voice\r\nSTYLE PROMPT: warm bass\r\nsteady drums\r\n\r\nLYRICS:\r\n[Verse 1]\r\nCœur (yeah)\r\n[Chorus]\r\nKeep going');
  assert.equal(p.style,'warm bass\nsteady drums');
  assert.equal(p.lyrics,'[Verse 1]\nCœur (yeah)\n[Chorus]\nKeep going');
  assert.equal(C.title(p),'Test Track — V02');
  assert.equal(p.voice,'Test Voice');
});

test('JSON metadata stays outside lyrics',()=>{
  const p=C.parse(JSON.stringify({title:'Test',version:'Cover V03',style:'Bass',lyrics:'[Verse]\nhello\n(yeah)',workflow:'Cover',source_url:'https://suno.com/song/abc-123'}));
  assert.equal(p.lyrics,'[Verse]\nhello\n(yeah)');
  assert.equal(p.workflow,'Cover');
});

test('LRC timestamps can be stripped while Suno tags survive',()=>{
  const p='[00:02.980] Yeah\n[Verse 1]\n(backs)\n[02:10] Finish';
  assert.equal(C.stripTimes(p),'Yeah\n[Verse 1]\n(backs)\nFinish');
});

test('rejects external sources, invalid types and incomplete packs',()=>{
  for(const extra of [{source_url:'javascript:alert(1)'},{source_url:'https://suno.com.evil.test/song/a'},{source_url:'https://suno.com/settings'},{voice:123},{lyrics:''}])
    assert.throws(()=>C.parse(JSON.stringify({title:'A',style:'B',lyrics:'C',...extra})));
  assert.throws(()=>C.parse('TITLE: A'));
});

test('safety denylist blocks generation and destructive actions',()=>{
  for(const s of ['Créer','Create 10 credits','Générer','Supprimer','Delete song','Enregistrer','Publish','Create a Voice']) assert.equal(C.forbidden(s),true,s);
  for(const s of ['Test Voice','Cover','Extend','Inspiration','Workspaces','My music']) assert.equal(C.forbidden(s),false,s);
});
