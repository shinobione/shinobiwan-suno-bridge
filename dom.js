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
  function exactVisibleText(value,exclude){
    if(!value)return true; const wanted=norm(value);
    return [...document.querySelectorAll('button,[role=button],[role=option],[role=menuitem],[aria-label],span,div')]
      .some(el=>visible(el)&&!(exclude&&exclude.contains(el))&&norm(el.innerText||el.textContent)===wanted);
  }
  function workflowOk(value,exclude){
    if(!value)return true; const w=norm(value);
    if(['create','new','new track'].includes(w)&&/^\/create(?:\/|$)/.test(location.pathname))return true;
    return exactVisibleText(value,exclude);
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
  root.SunoBridgeDom={visible,editable,norm,descriptor,fromDescriptor,autoField,exactVisibleText,workflowOk,write,value,debugField,candidateScore,styleBySection};
})(globalThis);
