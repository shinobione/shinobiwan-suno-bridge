(function(root){
  const C=root.SunoBridgeCore;
  const visible=el=>!!el&&!!el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden';
  const editable=el=>!!el&&el.matches('textarea,input:not([type]),input[type=text],input[type=search],[contenteditable=true],[contenteditable=plaintext-only]');
  const norm=s=>C.norm(s).toLowerCase();
  const descriptor=el=>{
    for(const attr of ['aria-label','placeholder','name','data-testid','id','title']){
      const value=el.getAttribute(attr); if(value)return{tag:el.tagName.toLowerCase(),attr,value};
    }
    return null;
  };
  const fromDescriptor=d=>d?[...document.querySelectorAll(d.tag)].find(el=>visible(el)&&el.getAttribute(d.attr)===d.value)||null:null;
  function context(el){
    let text=[el.getAttribute('aria-label'),el.getAttribute('placeholder'),el.getAttribute('name'),el.getAttribute('title')].filter(Boolean).join(' ');
    let p=el.parentElement,depth=0;
    while(p&&depth++<3&&text.length<500){text+=' '+(p.innerText||'');p=p.parentElement;}
    return norm(text);
  }
  const keywords={
    title:['title','titre','song title','track title'],
    style:['style','styles','style of music','music style'],
    lyrics:['lyrics','paroles','write lyrics','écrire des paroles']
  };
  function autoField(kind,manualMap={}){
    const manual=fromDescriptor(manualMap[kind]); if(manual&&editable(manual))return manual;
    const selector='textarea,input:not([type]),input[type=text],input[type=search],[contenteditable=true],[contenteditable=plaintext-only]';
    let best=null,bestScore=0;
    for(const el of [...document.querySelectorAll(selector)].filter(visible)){
      const c=context(el); let score=0;
      for(const k of keywords[kind])if(c.includes(k))score+=4;
      if(kind==='lyrics'&&el.tagName==='TEXTAREA')score++;
      if(kind==='title'&&el.tagName==='INPUT')score++;
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
  function replaceRichText(el,text){
    el.focus();
    selectContents(el);
    // Suno's rich lyrics editor can append when insertText is used on a selected range.
    // Delete the selected editor contents explicitly first, then insert once.
    document.execCommand('delete',false,null);
    if(value(el).trim()){
      // A second deletion handles editors that leave a generated paragraph/node behind.
      selectContents(el);
      document.execCommand('delete',false,null);
    }
    if(!document.execCommand('insertText',false,text))throw Error('Éditeur riche non compatible.');
    el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:text}));
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
  const value=el=>('value'in el?el.value:el.innerText).replace(/\r\n?/g,'\n');
  root.SunoBridgeDom={visible,editable,norm,descriptor,fromDescriptor,autoField,exactVisibleText,workflowOk,write,value};
})(globalThis);
