(function(root){
  const C=root.SunoBridgeCore;
  const visible=el=>!!el&&!!el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden';
  const editable=el=>!!el&&el.matches('textarea,input:not([type]),input[type=text],input[type=search],[contenteditable=true],[contenteditable=plaintext-only],[role=textbox],[data-lexical-editor=true],.ProseMirror');
  const norm=s=>C.norm(s).toLowerCase();
  const descriptor=el=>{
    for(const attr of ['aria-label','placeholder','name','data-testid','id','title','role']){
      const value=el.getAttribute(attr); if(value)return{tag:el.tagName.toLowerCase(),attr,value};
    }
    return null;
  };
  const fromDescriptor=d=>d?[...document.querySelectorAll(d.tag)].find(el=>visible(el)&&el.getAttribute(d.attr)===d.value)||null:null;
  function ownContext(el){
    return norm([el.getAttribute('aria-label'),el.getAttribute('placeholder'),el.getAttribute('name'),el.getAttribute('title'),el.getAttribute('data-testid'),el.id].filter(Boolean).join(' '));
  }
  function nearbyContext(el,maxDepth=2){
    let text=ownContext(el),p=el.parentElement,depth=0;
    while(p&&depth++<maxDepth&&text.length<700){text+=' '+(p.innerText||'');p=p.parentElement;}
    return norm(text);
  }
  const keywords={
    title:['title','titre','song title','track title'],
    style:['style','styles','style of music','music style'],
    lyrics:['lyrics','paroles','write lyrics','écrire des paroles','ecrire des paroles']
  };
  const badStyle=/(exclude|excluded|exclure|exclus|negative style|style influence|influence du style|étrangeté|etrangete|weirdness|plus options|advanced options|options avancées)/i;
  function candidateScore(kind,el){
    const own=ownContext(el),near=nearbyContext(el,2);let score=0;
    for(const k of keywords[kind]){
      if(own.includes(k))score+=12;
      else if(near.includes(k))score+=4;
    }
    if(kind==='lyrics'){
      if(el.tagName==='TEXTAREA')score+=2;
      if(el.isContentEditable)score+=3;
      if(el.matches('[data-lexical-editor=true],.ProseMirror,[role=textbox]'))score+=5;
    }
    if(kind==='style'){
      if(el.tagName==='TEXTAREA'||el.isContentEditable||el.matches('[role=textbox],[data-lexical-editor=true],.ProseMirror'))score+=3;
      if(badStyle.test(own))score-=40;
      else if(badStyle.test(near))score-=18;
    }
    if(kind==='title'&&el.tagName==='INPUT')score+=3;
    return score;
  }
  const editSelector='textarea,input:not([type]),input[type=text],input[type=search],[contenteditable=true],[contenteditable=plaintext-only],[role=textbox],[data-lexical-editor=true],.ProseMirror';
  function styleBySection(){
    const labels=[...document.querySelectorAll('div,span,label,button,h1,h2,h3,h4,p')].filter(visible)
      .filter(el=>['style','styles'].includes(norm(el.innerText||el.textContent)));
    let best=null,bestScore=-Infinity;
    for(const label of labels){
      let box=label.parentElement,depth=0;
      while(box&&depth++<5){
        for(const el of [...box.querySelectorAll(editSelector)].filter(visible)){
          const own=ownContext(el),near=nearbyContext(el,2);
          if(badStyle.test(own)||badStyle.test(near))continue;
          let score=30-(depth*3)+candidateScore('style',el);
          const r1=label.getBoundingClientRect(),r2=el.getBoundingClientRect();
          if(r2.top>=r1.top-20)score+=4;
          if(Math.abs(r2.left-r1.left)<260)score+=3;
          if(score>bestScore){best=el;bestScore=score;}
        }
        box=box.parentElement;
      }
    }
    return best;
  }
  function autoField(kind,manualMap={}){
    const manual=fromDescriptor(manualMap[kind]); if(manual&&editable(manual))return manual;
    if(kind==='style'){
      const section=styleBySection();
      if(section)return section;
    }
    let best=null,bestScore=0;
    for(const el of [...document.querySelectorAll(editSelector)].filter(visible)){
      const score=candidateScore(kind,el);
      if(score>bestScore){best=el;bestScore=score;}
    }
    return bestScore>=4?best:null;
  }
  // Suno uses both buttons/popovers and normal links for Workspace rows.
  const choiceSelector='a[href],button,[role=button],[role=option],[role=menuitem],[role=radio],[aria-haspopup]';
  const textOf=el=>norm(el?.innerText||el?.textContent||el?.getAttribute?.('aria-label')||'');
  function exactVisibleText(value,exclude){
    if(!value)return true; const wanted=norm(value);
    return [...document.querySelectorAll('a[href],button,[role=button],[role=option],[role=menuitem],[aria-label],span,div')]
      .some(el=>visible(el)&&!(exclude&&exclude.contains(el))&&textOf(el)===wanted);
  }
  function workflowOk(value,exclude){
    if(!value)return true; const w=norm(value);
    if(['create','new','new track'].includes(w)&&/^\/create(?:\/|$)/.test(location.pathname))return true;
    return exactVisibleText(value,exclude);
  }
  function safeClickable(el,exclude){
    if(!el||!visible(el)||(exclude&&exclude.contains(el)))return null;
    const click=el.matches(choiceSelector)?el:el.closest(choiceSelector);
    if(!click||!visible(click)||(exclude&&exclude.contains(click)))return null;
    const label=(click.innerText||click.textContent||click.getAttribute('aria-label')||'').trim();
    if(C.forbidden(label))return null;
    if(click.disabled||click.getAttribute('aria-disabled')==='true')return null;
    return click;
  }
  function triggerFor(kind,exclude){
    const labels=kind==='workspace'?['workspaces','workspace']:['+ voice','voice','+ voix','voix'];
    let best=null,bestScore=-Infinity;
    for(const el of [...document.querySelectorAll(choiceSelector)].filter(visible)){
      if(exclude&&exclude.contains(el))continue;
      const t=textOf(el),own=ownContext(el);let score=0;
      for(const label of labels){
        if(t===label)score=Math.max(score,50);
        else if(t.startsWith(label+' '))score=Math.max(score,35);
        else if(own.includes(label))score=Math.max(score,25);
      }
      if(kind==='voice'&&/create a voice|créer une voix|creer une voix/.test(t))score-=100;
      if(C.forbidden(t))score-=100;
      if(score>bestScore){best=el;bestScore=score;}
    }
    return bestScore>=20?safeClickable(best,exclude):null;
  }
  function optionFor(value,exclude){
    const wanted=norm(value);let best=null,bestScore=-Infinity;
    for(const el of [...document.querySelectorAll(choiceSelector)].filter(visible)){
      if(exclude&&exclude.contains(el))continue;
      const click=safeClickable(el,exclude);if(!click)continue;
      const t=textOf(el);let score=-Infinity;
      if(t===wanted)score=60;
      else if(t.startsWith(wanted+' '))score=35;
      else continue;
      const role=el.getAttribute('role');
      if(role==='option'||role==='menuitem'||role==='radio')score+=10;
      if(el.tagName==='A')score+=8;
      if(el.getAttribute('aria-selected')==='true'||el.getAttribute('data-state')==='checked')score+=5;
      if(score>bestScore){best=click;bestScore=score;}
    }
    return best;
  }
  function selectedChoice(kind,value,exclude){
    if(!value)return false;const wanted=norm(value),trigger=triggerFor(kind,exclude);
    if(trigger){
      const t=textOf(trigger),ctx=nearbyContext(trigger,1);
      if(t===wanted||ctx.includes(wanted))return true;
    }
    return [...document.querySelectorAll('[aria-selected=true],[aria-checked=true],[data-state=checked],[data-state=selected]')]
      .some(el=>visible(el)&&!(exclude&&exclude.contains(el))&&textOf(el)===wanted);
  }
  async function selectNamed(kind,value,exclude,delay=ms=>new Promise(r=>setTimeout(r,ms))){
    const wanted=String(value||'').trim();
    if(!wanted)return{ok:true,mode:'skipped'};
    if(selectedChoice(kind,wanted,exclude))return{ok:true,mode:'already'};

    // Workspace can already be displayed as a full-page list. Prefer a visible exact row
    // before trying to reopen the Workspaces control. The Voice dialog benefits too.
    const visibleOption=optionFor(wanted,exclude);
    if(visibleOption){
      visibleOption.click();
      await delay(kind==='workspace'?650:450);
      const ok=selectedChoice(kind,wanted,exclude)||exactVisibleText(wanted,exclude);
      return ok?{ok:true,mode:'selected-visible'}:{ok:false,stage:'confirm',message:`Sélection ${kind} non confirmée : ${wanted}.`};
    }

    const trigger=triggerFor(kind,exclude);
    if(!trigger)return{ok:false,stage:'trigger',message:`Contrôle ${kind} introuvable.`};
    trigger.click();
    await delay(350);
    const option=optionFor(wanted,exclude);
    if(!option)return{ok:false,stage:'option',message:`${kind==='workspace'?'Workspace':'Voice'} “${wanted}” introuvable après ouverture du menu.`};
    option.click();
    await delay(kind==='workspace'?650:450);
    const ok=selectedChoice(kind,wanted,exclude)||exactVisibleText(wanted,exclude);
    return ok?{ok:true,mode:'selected'}:{ok:false,stage:'confirm',message:`Sélection ${kind} non confirmée : ${wanted}.`};
  }
  function selectContents(el){
    const sel=getSelection(),range=document.createRange();
    range.selectNodeContents(el);sel.removeAllRanges();sel.addRange(range);
  }
  const value=el=>('value'in el?el.value:el.innerText).replace(/\r\n?/g,'\n');
  function fireInput(el,inputType,data=null){
    try{el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType,data}));}
    catch{el.dispatchEvent(new Event('input',{bubbles:true}));}
  }
  function replaceRichText(el,text){
    el.focus();
    document.execCommand('selectAll',false,null);
    document.execCommand('insertText',false,text);
    if(C.semanticText(value(el))!==C.semanticText(text)){
      el.focus();selectContents(el);document.execCommand('delete',false,null);
      if(value(el).trim()){
        selectContents(el);document.execCommand('delete',false,null);
      }
      document.execCommand('insertText',false,text);
    }
    if(C.semanticText(value(el))!==C.semanticText(text)){
      el.focus();
      el.replaceChildren();
      fireInput(el,'deleteContentBackward',null);
      el.textContent=text;
      fireInput(el,'insertText',text);
    }
    el.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function write(el,text){
    el.focus();
    if(el.tagName==='INPUT'||el.tagName==='TEXTAREA'){
      const proto=el.tagName==='INPUT'?HTMLInputElement.prototype:HTMLTextAreaElement.prototype;
      Object.getOwnPropertyDescriptor(proto,'value').set.call(el,text);
      el.dispatchEvent(new Event('input',{bubbles:true}));
      el.dispatchEvent(new Event('change',{bubbles:true}));
    }else replaceRichText(el,text);
    el.blur();
  }
  function debugField(el){
    if(!el)return 'introuvable';
    const d=descriptor(el);return `${el.tagName.toLowerCase()}${el.isContentEditable?'[contenteditable]':''}${d?` ${d.attr}="${d.value}"`:''}`;
  }
  root.SunoBridgeDom={visible,editable,norm,descriptor,fromDescriptor,autoField,exactVisibleText,workflowOk,write,value,debugField,candidateScore,styleBySection,triggerFor,optionFor,selectedChoice,selectNamed,safeClickable};
})(globalThis);
