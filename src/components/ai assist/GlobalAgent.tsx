import './agent-workspace.css';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useLocation, Link, useSearchParams } from 'react-router';
const AgentTools=lazy(()=>import('./AgentTools').then(module=>({default:module.AgentTools})));
import {AgentContentHistory} from './AgentContentHistory';
import {AgentTurn,selectClass,type ConfirmAction} from './AgentFeed';
import {LioAvatar,LioGreeting,type LioState} from './LioAvatar';
import { useAiAssistChatStore } from '@/store/aiassistchat.store';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, History, Square, ChartNoAxesCombined, ListTodo, FileText, ArrowUp, MessageSquarePlus, ChevronDown } from 'lucide-react';
import { useUser } from '@/providers/user.provider';
import { useDataScope } from '@/hooks/useDataScope';
import { useHasFeatureAccess } from '@/hooks/usePlanAccess';
import { axios } from '@/configs/axios.config';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { OPEN_AGENT_EVENT, agentAreas, agentScopeForPath, canUseAgent, type AgentScope, type AgentRun, type AgentSource } from './agent-context';

type Status=(state:LioState)=>void;
export function GlobalAgent() {
  const {data}=useUser();const {pathname}=useLocation();
  if(!canUseAgent(data?.user)||(!pathname.startsWith('/dashboard')&&!pathname.startsWith('/viewer')))return null;
  return <AgentLauncher key={`${data?.user.organizationId}:${data?.user.id}:${pathname}`} />;
}
function AgentLauncher(){
  const [open,setOpen]=useState(false);const {t,i18n}=useTranslation();const {pathname}=useLocation();
  const [params,setParams]=useSearchParams();const [initialTab,setInitialTab]=useState('assistant');const [lio,setLio]=useState<LioState>('idle');
  useEffect(()=>{if(params.get('ai')==='tools'){setInitialTab('tools');setOpen(true);const next=new URLSearchParams(params);next.delete('ai');setParams(next,{replace:true});}},[params,setParams]);
  const [context,setContext]=useState<{scope:AgentScope;prompt?:string}>({scope:agentScopeForPath(pathname)});
  useEffect(()=>{const handler=(e:Event)=>{const detail=(e as CustomEvent).detail;if(!detail?.scope||!agentAreas.includes(detail.scope.area))return;setContext(detail);setInitialTab('assistant');setOpen(true);};window.addEventListener(OPEN_AGENT_EVENT,handler);return()=>window.removeEventListener(OPEN_AGENT_EVENT,handler);},[]);
  return <Sheet open={open} onOpenChange={setOpen}>
    <SheetTrigger asChild><Button variant="outline" className="ai-launcher gap-2 border-primary/25 text-primary" aria-label={t('agent.launcher')}><LioAvatar size={26}/><span className="hidden sm:inline">{t('agent.launcher')}</span></Button></SheetTrigger>
    <SheetContent side={i18n.dir()==='rtl'?'left':'right'} className="workspace-ai w-full sm:max-w-[720px] gap-0 p-0 overflow-hidden">
      <SheetHeader className="ai-sheet-heading"><div className="ai-identity"><LioAvatar state={lio} size={44}/><div className="min-w-0"><SheetTitle className="ai-sheet-title">Lio</SheetTitle><SheetDescription aria-live="polite">{t(`agent.lio.${lio}`)}</SheetDescription></div></div></SheetHeader>
      {open&&<AgentAccess key={JSON.stringify(context)} initialScope={context.scope} initialPrompt={context.prompt} initialTab={initialTab} onStatus={setLio}/>}
    </SheetContent>
  </Sheet>;
}
function AgentAccess({initialScope,initialPrompt,initialTab,onStatus}:{initialScope:AgentScope;initialPrompt?:string;initialTab:string;onStatus:Status}){
 const {data,isLoading,isError}=useHasFeatureAccess('aiAssist');const {t}=useTranslation();
 if(isLoading)return <p className="p-6" role="status">{t('agent.loading')}</p>;
 if(isError||!data?.data?.hasAccess)return <p className="p-6" role="alert">{t('agent.unavailable')}</p>;
 return <AgentHub initialScope={initialScope} initialPrompt={initialPrompt} initialTab={initialTab} onStatus={onStatus}/>;
}
function AgentHub({initialScope,initialPrompt,initialTab,onStatus}:{initialScope:AgentScope;initialPrompt?:string;initialTab:string;onStatus:Status}){
 const {t}=useTranslation();const {data}=useUser();const [tab,setTab]=useState(initialTab),[context,setContext]=useState({scope:initialScope,prompt:initialPrompt}),[contentOpen,setContentOpen]=useState(0),[historyRequest,setHistoryRequest]=useState(0),[visitedTools,setVisitedTools]=useState(initialTab==='tools');
 const load=useAiAssistChatStore(s=>s.loadUserChats),selectChat=useAiAssistChatStore(s=>s.setActiveChat);
 useEffect(()=>{if(data?.user.id)void load(data.user.id);},[data?.user.id,load]);
 const openTools=()=>{setVisitedTools(true);setTab('tools');};
 return <div className="flex min-h-0 flex-1 flex-col"><div role="tablist" aria-label="Flowlio AI" className="ai-tabs">{['assistant','tools'].map(value=><button key={value} role="tab" id={`ai-tab-${value}`} aria-controls={`ai-panel-${value}`} aria-selected={tab===value} tabIndex={tab===value?0:-1} className={`border-b-2 px-4 pb-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-primary ${tab===value?'border-primary text-primary':'border-transparent text-muted-foreground'}`} onClick={()=>value==='tools'?openTools():setTab('assistant')} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?'assistant':e.key==='End'?'tools':tab==='assistant'?'tools':'assistant';if(next==='tools')openTools();else setTab('assistant');document.getElementById(`ai-tab-${next}`)?.focus();}}}>{t(`hub.${value}`)}</button>)}</div>
  <div role="tabpanel" id="ai-panel-assistant" aria-labelledby="ai-tab-assistant" className={tab==='assistant'?'flex min-h-0 flex-1 flex-col':'hidden'}><AgentWorkspace key={JSON.stringify(context)} initialScope={context.scope} initialPrompt={context.prompt} historyRequest={historyRequest} onTools={openTools} onStatus={onStatus} extraHistory={<AgentContentHistory onOpen={id=>{selectChat(id);setContentOpen(v=>v+1);openTools();}}/>}/></div>
  <div role="tabpanel" id="ai-panel-tools" aria-labelledby="ai-tab-tools" className={tab==='tools'?'flex min-h-0 flex-1 flex-col':'hidden'}>{visitedTools&&<Suspense fallback={<p className="p-5" role="status">{t('agent.loading')}</p>}><AgentTools contentOpen={contentOpen} onAssistant={(scope,prompt)=>{setContext({scope,prompt});setTab('assistant');}} onHistory={()=>{setHistoryRequest(v=>v+1);setTab('assistant');}}/></Suspense>}</div>
 </div>;
}
export function AgentWorkspace({initialScope,initialPrompt='',extraHistory,historyRequest=0,onTools,onStatus}:{initialScope:AgentScope;initialPrompt?:string;extraHistory?:React.ReactNode;historyRequest?:number;onTools?:()=>void;onStatus?:Status}){
 const {t,i18n}=useTranslation();const dataScope=useDataScope();const cache=useQueryClient();
 const {pathname}=useLocation();
 const [scope,setScope]=useState(initialScope),[prompt,setPrompt]=useState(initialPrompt),[automatic,setAutomatic]=useState(false),[busy,setBusy]=useState(false),[asking,setAsking]=useState(''),[error,setError]=useState(''),[historyOpen,setHistoryOpen]=useState(false),[scopeOpen,setScopeOpen]=useState(false);
 // Turns of the current conversation, oldest first; every turn keeps its own actions confirmable.
 const [turns,setTurns]=useState<AgentRun[]>([]);const [conversationId,setConversationId]=useState<string>(()=>crypto.randomUUID());
 const request=useRef<{id:string;controller:AbortController}|null>(null);const scroller=useRef<HTMLDivElement>(null);
 const latest=turns[turns.length-1];
 useEffect(()=>{const el=scroller.current;if(busy&&el)el.scrollTop=el.scrollHeight;},[busy]);
 useEffect(()=>{if(historyRequest)setHistoryOpen(true);},[historyRequest]);
 useEffect(()=>{onStatus?.(busy?'thinking':error||latest?.error?'error':latest?.result?'happy':'idle');},[busy,error,latest,onStatus]);
 const context=useQuery({queryKey:['agent-context',dataScope,scope],queryFn:async()=> (await axios.get<{data:{sources:AgentSource[];projects?:{id:string;title:string}[];members:{id:string;name:string}[];capabilities:string[]}}>('/ai/agent/context',{params:scope})).data.data,retry:false});
 const history=useQuery({queryKey:['agent-history',dataScope],queryFn:async()=> (await axios.get<{data:{id:string;state:string;area:string;created_at:string}[]}>('/ai/agent')).data.data,enabled:historyOpen,retry:false});
 useEffect(()=>()=>{const pending=request.current;if(pending){pending.controller.abort();void axios.post(`/ai/agent/${pending.id}/cancel`).catch(()=>{});}},[]);
 const failure=(e:any)=>t(`agent.errors.${e?.response?.data?.code??e?.response?.data?.error??'AGENT_FAILED'}`,{defaultValue:t('agent.failed')});
 const receive=(value:AgentRun)=>{setTurns(list=>list.some(r=>r.id===value.id)?list.map(r=>r.id===value.id?value:r):[...list,value].slice(-10));void cache.invalidateQueries({queryKey:['agent-history',dataScope]});};
 const projects=context.data?.projects??context.data?.sources.filter(s=>s.kind==='project').map(s=>({id:s.id,title:s.title}))??[];
 const projectTitle=scope.projectId?projects.find(p=>p.id===scope.projectId)?.title:undefined;
 async function generate(){
  const text=prompt.trim();if(request.current||!text)return;setError('');setBusy(true);setAsking(text);setPrompt('');setHistoryOpen(false);setScopeOpen(false);
  const current={id:crypto.randomUUID(),controller:new AbortController()};request.current=current;
  try{const response=await axios.post<{data:AgentRun}>('/ai/agent',{id:current.id,conversationId,scope,prompt:text,language:['en','pt','es','he'].includes(i18n.language.split('-')[0])?i18n.language.split('-')[0]:'en',mode:automatic?'internal':'review'},{signal:current.controller.signal,timeout:120000});receive(response.data.data);if(response.data.data.state==='applied')void cache.invalidateQueries();}
  catch(e){if(!current.controller.signal.aborted){setError(failure(e));setPrompt(text);try{receive((await axios.get<{data:AgentRun}>(`/ai/agent/${current.id}`)).data.data);}catch{/* The generation error remains visible. */}}}
  finally{if(request.current===current){request.current=null;setBusy(false);setAsking('');setAutomatic(false);}}
 }
 async function cancel(){const pending=request.current;if(!pending)return;pending.controller.abort();request.current=null;setBusy(false);setAsking('');setAutomatic(false);try{const cancelled=await axios.post<{data:{state:string}}>(`/ai/agent/${pending.id}/cancel`);if(cancelled.data.data.state==='cancelled')setError(t('agent.cancelled'));else await load(pending.id);void cache.invalidateQueries({queryKey:['agent-history',dataScope]});}catch(e){setError(failure(e));}}
 const confirmAction:ConfirmAction=async(target,index,edit,share)=>{setError('');try{receive((await axios.post<{data:AgentRun}>(`/ai/agent/${target.id}/apply`,{selected:[index],confirm:true,shareWithClient:share,edits:edit?{[String(index)]:edit}:{}})).data.data);void cache.invalidateQueries();return true;}catch(e){setError(failure(e));return false;}};
 async function load(id:string,resume=false){setError('');try{const value=(await axios.get<{data:AgentRun}>(`/ai/agent/${id}`)).data.data;if(resume){setTurns([value]);setConversationId(value.conversationId??crypto.randomUUID());}else receive(value);setHistoryOpen(false);}catch(e){setError(failure(e));}}
 async function cancelRun(id:string){try{await axios.post(`/ai/agent/${id}/cancel`);await load(id);}catch(e){setError(failure(e));}}
 function newConversation(){setConversationId(crypto.randomUUID());setTurns([]);setPrompt('');setError('');setAutomatic(false);}
 function changeScope(value:AgentScope){setScope(value);setAutomatic(false);setError('');}
 const canAuto=context.data?.capabilities.some(v=>v==='create_task'||v==='plan_task');
 const canSend=!!prompt.trim()&&!context.isPending&&!context.isError;
 const sourceStatus=context.isPending?t('agent.loading'):context.isError?t('agent.contextFailed'):context.data?.sources.length?t('agent.sourceCount',{count:context.data.sources.length}):t('agent.onDemand');
 return <div className="ai-workspace flex min-h-0 flex-1 flex-col">
  <div className="ai-toolbar">
   <div className="ai-toolbar-row">
    <button type="button" className="ai-scope" aria-expanded={scopeOpen} aria-controls="ai-scope-panel" disabled={busy} onClick={()=>setScopeOpen(v=>!v)}><span className="ai-scope-label">{t('agent.context')}</span><span className="ai-scope-value">{t(`agent.areas.${scope.area}`)}{projectTitle?` · ${projectTitle}`:''}</span><ChevronDown className="size-4 shrink-0" aria-hidden="true"/></button>
    <div className="ai-toolbar-actions">{turns.length>0&&<Button variant="ghost" size="sm" disabled={busy} onClick={newConversation}><MessageSquarePlus className="size-4"/><span>{t('agent.newConversation')}</span></Button>}<Button variant="ghost" size="sm" disabled={busy} aria-expanded={historyOpen} onClick={()=>setHistoryOpen(v=>!v)}><History className="size-4"/><span>{t('agent.history')}</span></Button></div>
   </div>
   <p className="ai-source-status">{sourceStatus}</p>
   {scopeOpen&&<div id="ai-scope-panel" className="ai-scope-panel">
    <label className="text-xs text-muted-foreground" htmlFor="agent-area">{t('agent.context')}<select id="agent-area" className={`${selectClass} mt-1`} value={scope.area} onChange={e=>changeScope({area:e.target.value as AgentScope['area']})}>{agentAreas.map(area=><option key={area} value={area}>{t(`agent.areas.${area}`)}</option>)}</select></label>
    <label className="text-xs text-muted-foreground">{t('agent.project')}<select className={`${selectClass} mt-1`} value={scope.projectId??''} onChange={e=>changeScope({...scope,projectId:e.target.value||undefined})}><option value="">{t('agent.accessibleProjects')}</option>{projects.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label>
    {scope.clientId&&<p className="text-xs text-muted-foreground sm:col-span-2">{t('agent.clientContext')}</p>}
   </div>}
  </div>
  <div ref={scroller} className="ai-feed flex-1 overflow-y-auto">
   {historyOpen&&<div className="ai-history"><h3>{t('agent.history')}</h3>{history.isError&&<p role="alert">{t('agent.failed')}</p>}{history.data?.length===0&&<p className="text-sm text-muted-foreground">{t('agent.noHistory')}</p>}{history.data?.map(item=><button key={item.id} className="ai-history-item" onClick={()=>load(item.id,true)}><span>{t(`agent.areas.${item.area}`)}<span className="block text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString(i18n.language)}</span></span><span className="text-xs text-muted-foreground">{t(`agent.states.${item.state}`)}</span></button>)}{extraHistory}</div>}
   {!turns.length&&!busy&&<div className="ai-welcome"><LioGreeting/><h3>{t('agent.helpTitle')}</h3><p>{t('agent.helpDescription')}</p><div className="ai-suggestions">{['analyze','act','brief'].map(key=><button key={key} className="ai-suggestion" onClick={()=>setPrompt(t(`agent.prompts.${scope.area}.${key}`,{defaultValue:t(`agent.prompts.default.${key}`)}))}><span className={`ai-suggestion-icon ai-suggestion-${key}`} aria-hidden="true">{key==='analyze'?<ChartNoAxesCombined/>:key==='act'?<ListTodo/>:<FileText/>}</span><span>{t(`agent.prompts.${scope.area}.${key}`,{defaultValue:t(`agent.prompts.default.${key}`)})}</span><ArrowUpRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true"/></button>)}</div></div>}
   {turns.map(run=><AgentTurn key={run.id} run={run} latest={run===latest&&!busy} onConfirm={confirmAction} onRefresh={()=>void load(run.id)} onCancel={()=>void cancelRun(run.id)}/>)}
   {busy&&<article className="ai-turn is-pending"><h3 className="ai-question">{asking}</h3><div className="ai-reply"><LioAvatar state="thinking" size={26} className="ai-reply-mark"/><p role="status" className="ai-thinking">{t('agent.working')}</p></div></article>}
   {error&&<p role="alert" className="ai-error">{error}</p>}
  </div>
  <form className="ai-composer" onSubmit={e=>{e.preventDefault();if(canSend)void generate();}}>
   <label htmlFor="agent-prompt" className="sr-only">{t('agent.request')}</label>
   <div className="ai-input">
    <Textarea id="agent-prompt" rows={1} maxLength={8000} value={prompt} disabled={busy} onChange={e=>setPrompt(e.target.value)} placeholder={t('agent.placeholder')} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();if(canSend&&!busy)void generate();}}}/>
    {busy?<Button type="button" size="icon" variant="outline" aria-label={t('agent.cancel')} onClick={cancel}><Square className="size-3.5"/></Button>:<Button type="submit" size="icon" aria-label={t('agent.generate')} disabled={!canSend}><ArrowUp className="size-4"/></Button>}
   </div>
   <div className="ai-composer-foot">
    {canAuto?<label className="ai-auto"><input type="checkbox" checked={automatic} disabled={busy} onChange={e=>setAutomatic(e.target.checked)}/>{t('agent.automatic')}</label>:<span/>}
    {onTools?<button type="button" className="ai-foot-link" disabled={busy} onClick={onTools}>{t('hub.tools')}</button>:<Link to={pathname.startsWith('/viewer')?'/viewer/ai-assistant':'/dashboard/ai-assist'} className="ai-foot-link">{t('agent.otherTools')}</Link>}
   </div>
  </form>
 </div>;
}
