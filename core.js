(function (root) {
  const clean = s => String(s ?? '').replace(/\r\n?/g, '\n');
  function parse(input) {
    let text = clean(input).replace(/^\uFEFF/, '').trim();
    if (text.startsWith('```')) text = text.replace(/^```(?:json|text|txt)?\s*\n/, '').replace(/\n```\s*$/, '');
    let pack;
    if (text.startsWith('{')) pack = JSON.parse(text);
    else {
      const lyricsStart = /^LYRICS:[ \t]*(.*)$/mi.exec(text);
      if (!lyricsStart) throw Error('LYRICS: absent du fichier.');
      const header = text.slice(0, lyricsStart.index);
      const get = key => new RegExp('^' + key + ':[ \\t]*(.*)$', 'mi').exec(header)?.[1]?.trim() || '';
      const style = /^STYLE PROMPT:[ \t]*([\s\S]*)$/mi.exec(header)?.[1]?.trim() || '';
      pack = {title:get('TITLE'), version:get('VERSION'), profile:get('PROFILE'), workflow:get('WORKFLOW'), workspace:get('WORKSPACE'), voice:get('VOICE'), source_url:get('SOURCE URL'), style, lyrics:text.slice(lyricsStart.index + 'LYRICS:'.length).replace(/^[ \t]*\n?/, '')};
    }
    if (!pack || typeof pack !== 'object' || Array.isArray(pack)) throw Error('Pack invalide.');
    for (const key of ['title','style','lyrics']) {
      if (typeof pack[key] !== 'string' || !pack[key].trim()) throw Error('Champ requis : ' + key);
      pack[key] = clean(pack[key]);
    }
    for (const key of ['version','profile','workflow','workspace','voice','source_url']) {
      if (pack[key] != null && typeof pack[key] !== 'string') throw Error('Texte attendu : '+key);
      pack[key] = pack[key] || '';
    }
    if (pack.source_url && !/^https:\/\/(www\.)?suno\.com\/(song|s)\/[a-zA-Z0-9_-]+\/?(?:\?[^\s]*)?$/.test(pack.source_url)) throw Error('Le morceau source doit être un lien Suno /song/ ou /s/.');
    return pack;
  }
  const title = pack => pack.title.trim() + (pack.version.trim() ? ' — ' + pack.version.trim() : '');
  const stripTimes = lyrics => lyrics.replace(/^\[\d{1,2}:\d{2}(?:[.:]\d{1,3})?\][ \t]*/gm, '');
  const norm = text => String(text || '').replace(/\s+/g, ' ').trim();
  const exactText = text => clean(text).replace(/\u00a0/g,' ').replace(/[\u200B-\u200D\uFEFF]/g,'').trim();
  const semanticText = text => exactText(text).replace(/\s+/g,' ').trim();
  function validateText(kind, actual, expected) {
    const aExact=exactText(actual), eExact=exactText(expected);
    if(aExact===eExact) return {ok:true, mode:'exact'};
    if((kind==='style'||kind==='lyrics') && semanticText(aExact)===semanticText(eExact)) return {ok:true, mode:'normalized'};
    return {ok:false, mode:'mismatch', actualChars:aExact.length, expectedChars:eExact.length};
  }
  // Deny destructive/submitting actions, including buttons with generation-credit labels.
  const forbidden = text => /(?:\b(?:create|créer|creer|generate|générer|generer|delete|supprimer|remove|retirer|publish|publier|purchase|buy|acheter|subscribe|abonner|save|enregistrer|confirm|confirmer|submit|envoyer|logout|déconnecter|upgrade)\b|credits?\b|crédits?\b)/i.test(text);
  const api = {parse, title, stripTimes, norm, exactText, semanticText, validateText, forbidden};
  root.SunoBridgeCore = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
