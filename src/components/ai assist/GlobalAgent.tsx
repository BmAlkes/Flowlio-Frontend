import { useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Sparkles, ArrowUpRight, Loader2, History, Check, Square, BookOpen } from 'lucide-react';
import { useUser } from '@/providers/user.provider';
import { useDataScope } from '@/hooks/useDataScope';
import { useHasFeatureAccess } from '@/hooks/usePlanAccess';
import { axios } from '@/configs/axios.config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { OPEN_AGENT_EVENT, agentAreas, agentScopeForPath, canUseAgent, type AgentScope, type AgentAction, type AgentRun, type AgentSource } from './agent-context';

const selectClass='h-10 w-full rounded-md border border-input bg-background px-3 text-sm min-w-0';
export function GlobalAgent() {
  const {data}=useUser();const {pathname}=useLocation();
  if(!canUseAgent(data?.user)||(!pathname.startsWith('/dashboard')&&!pathname.startsWith('/viewer')))return null;
  return <AgentLauncher key={`${data?.user.organizationId}:${data?.user.id}:${pathname}`} />;
}
function AgentLauncher(){
  const [open,setOpen]=useState(false);const {t,i18n}=useTranslation();const {pathname}=useLocation();
  const [context,setContext]=useState<{scope:AgentScope;prompt?:string}>({scope:agentScopeForPath(pathname)});
  useEffect(()=>{const handler=(e:Event)=>{const detail=(e as CustomEvent).detail;if(!detail?.scope||!agentAreas.includes(detail.scope.area))return;setContext(detail);setOpen(true);};window.addEventListener(OPEN_AGENT_EVENT,handler);return()=>window.removeEventListener(OPEN_AGENT_EVENT,handler);},[]);
  return <Sheet open={open} onOpenChange={setOpen}>
    <SheetTrigger asChild><Button variant="outline" className="gap-2 border-primary/25 text-primary"><Sparkles className="size-4"/><span>Flowlio AI</span></Button></SheetTrigger>
    <SheetContent side={i18n.dir()==='rtl'?'left':'right'} className="w-full sm:max-w-[640px] gap-0 p-0 overflow-hidden">
      <SheetHeader className="border-b px-6 py-5 pe-12"><SheetTitle className="flex items-center gap-2"><Sparkles className="size-5 text-primary"/>Flowlio AI</SheetTitle><SheetDescription>{t('agent.subtitle')}</SheetDescription></SheetHeader>
      {open&&<AgentAccess key={JSON.stringify(context)} initialScope={context.scope} initialPrompt={context.prompt}/>}
    </SheetContent>
  </Sheet>;
}
function AgentAccess({initialScope,initialPrompt}:{initialScope:AgentScope;initialPrompt?:string}){
 const {data,isLoading,isError}=useHasFeatureAccess('aiAssist');const {t}=useTranslation();
 if(isLoading)return <p className="p-6" role="status">{t('agent.loading')}</p>;
 if(isError||!data?.data?.hasAccess)return <p className="p-6" role="alert">{t('agent.unavailable')}</p>;
 return <AgentWorkspace initialScope={initialScope} initialPrompt={initialPrompt}/>;
}
export function AgentWorkspace({initialScope,initialPrompt=''}:{initialScope:AgentScope;initialPrompt?:string}){
 const {t,i18n}=useTranslation();const dataScope=useDataScope();const cache=useQueryClient();
 const {pathname}=useLocation();
 const [scope,setScope]=useState(initialScope),[prompt,setPrompt]=useState(initialPrompt),[automatic,setAutomatic]=useState(false),[run,setRun]=useState<AgentRun|null>(null),[busy,setBusy]=useState(false),[applying,setApplying]=useState(false),[error,setError]=useState(''),[historyOpen,setHistoryOpen]=useState(false);
 const [selected,setSelected]=useState<number[]>([]),[confirmed,setConfirmed]=useState(false),[sharing,setSharing]=useState(false),[edits,setEdits]=useState<Record<string,AgentAction>>({});
 const request=useRef<{id:string;controller:AbortController}|null>(null);
 const context=useQuery({queryKey:['agent-context',dataScope,scope],queryFn:async()=> (await axios.get<{data:{sources:AgentSource[];members:{id:string;name:string}[];capabilities:string[]}}>('/ai/agent/context',{params:scope})).data.data,retry:false});
 const history=useQuery({queryKey:['agent-history',dataScope],queryFn:async()=> (await axios.get<{data:{id:string;state:string;area:string;created_at:string}[]}>('/ai/agent')).data.data,enabled:historyOpen,retry:false});
 useEffect(()=>()=>{const pending=request.current;if(pending){pending.controller.abort();void axios.post(`/ai/agent/${pending.id}/cancel`).catch(()=>{});}},[]);
 const failure=(e:any)=>t(`agent.errors.${e?.response?.data?.code??'AGENT_FAILED'}`,{defaultValue:t('agent.failed')});
 const resetReview=()=>{setSelected([]);setConfirmed(false);setSharing(false);setEdits({});};
 const receive=(value:AgentRun)=>{setRun(value);resetReview();void cache.invalidateQueries({queryKey:['agent-history',dataScope]});};
 async function generate(){
  if(request.current||!prompt.trim())return;setError('');setBusy(true);setRun(null);resetReview();
  const current={id:crypto.randomUUID(),controller:new AbortController()};request.current=current;
  try{const response=await axios.post<{data:AgentRun}>('/ai/agent',{id:current.id,scope,prompt,language:['en','pt','es','he'].includes(i18n.language.split('-')[0])?i18n.language.split('-')[0]:'en',mode:automatic?'internal':'review'},{signal:current.controller.signal,timeout:120000});receive(response.data.data);if(response.data.data.state==='applied')void cache.invalidateQueries();}
  catch(e){if(!current.controller.signal.aborted){setError(failure(e));try{receive((await axios.get<{data:AgentRun}>(`/ai/agent/${current.id}`)).data.data);}catch{/* The generation error remains visible. */}}}
  finally{if(request.current===current){request.current=null;setBusy(false);setAutomatic(false);}}
 }
 async function cancel(){const pending=request.current;if(!pending)return;pending.controller.abort();request.current=null;setBusy(false);setAutomatic(false);try{const cancelled=await axios.post<{data:{state:string}}>(`/ai/agent/${pending.id}/cancel`);if(cancelled.data.data.state==='cancelled')setError(t('agent.cancelled'));else await load(pending.id);void cache.invalidateQueries({queryKey:['agent-history',dataScope]});}catch(e){setError(failure(e));}}
 async function apply(){if(!run||!confirmed||!selected.length||applying)return;setApplying(true);setError('');try{receive((await axios.post<{data:AgentRun}>(`/ai/agent/${run.id}/apply`,{selected,confirm:true,shareWithClient:sharing,edits:Object.fromEntries(Object.entries(edits).filter(([key])=>selected.includes(Number(key))))})).data.data);void cache.invalidateQueries();}catch(e){setError(failure(e));}finally{setApplying(false);}}
 async function load(id:string){setError('');try{receive((await axios.get<{data:AgentRun}>(`/ai/agent/${id}`)).data.data);setHistoryOpen(false);}catch(e){setError(failure(e));}}
 function changeScope(value:AgentScope){setScope(value);setRun(null);resetReview();setAutomatic(false);setError('');}
 const actions=run?.result?.actions??[];const needsSharing=selected.some(i=>actions[i]?.type==='client_request');
 const canAuto=context.data?.capabilities.some(v=>v==='create_task'||v==='plan_task');
 return <div className="flex min-h-0 flex-1 flex-col">
  <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
   <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
    <div className="flex items-center justify-between gap-3"><label htmlFor="agent-area" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('agent.context')}</label><Button variant="ghost" size="sm" disabled={busy||applying} onClick={()=>setHistoryOpen(v=>!v)}><History className="size-4"/>{t('agent.history')}</Button></div>
    <select id="agent-area" className={selectClass} value={scope.area} disabled={busy||applying} onChange={e=>changeScope({area:e.target.value as AgentScope['area']})}>{agentAreas.map(area=><option key={area} value={area}>{t(`agent.areas.${area}`)}</option>)}</select>
    <label className="block text-xs text-muted-foreground">{t('agent.project')}<select className={`${selectClass} mt-1`} disabled={busy||applying} value={scope.projectId??''} onChange={e=>changeScope({...scope,projectId:e.target.value||undefined})}><option value="">{t('agent.accessibleProjects')}</option>{context.data?.sources.filter(s=>s.kind==='project').map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></label>
    {scope.clientId&&<p className="text-xs text-muted-foreground">{t('agent.clientContext')}</p>}
    <p className="flex gap-2 text-xs text-muted-foreground"><BookOpen className="size-4 shrink-0"/>{context.isPending?t('agent.loading'):context.isError?t('agent.contextFailed'):t('agent.sourceCount',{count:context.data?.sources.length??0})}</p>
   </div>
   {historyOpen&&<div className="space-y-2"><h3 className="font-semibold">{t('agent.history')}</h3>{history.isError&&<p role="alert">{t('agent.failed')}</p>}{history.data?.length===0&&<p className="text-sm text-muted-foreground">{t('agent.noHistory')}</p>}{history.data?.map(item=><button key={item.id} className="flex w-full items-center justify-between rounded-lg border p-3 text-start text-sm hover:bg-muted focus-visible:outline-primary" onClick={()=>load(item.id)}><span>{t(`agent.areas.${item.area}`)}<span className="block text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString(i18n.language)}</span></span><span>{t(`agent.states.${item.state}`)}</span></button>)}</div>}
   {!run&&!busy&&<div className="space-y-3"><h3 className="text-lg font-semibold tracking-tight">{t('agent.helpTitle')}</h3><p className="text-sm text-muted-foreground">{t('agent.helpDescription')}</p><div className="grid gap-2">{['analyze','act','brief'].map(key=><button key={key} className="rounded-lg border px-3 py-3 text-start text-sm hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-primary" onClick={()=>setPrompt(t(`agent.prompts.${scope.area}.${key}`,{defaultValue:t(`agent.prompts.default.${key}`)}))}>{t(`agent.prompts.${scope.area}.${key}`,{defaultValue:t(`agent.prompts.default.${key}`)})}</button>)}</div></div>}
   {busy&&<p role="status" className="flex items-center gap-2 text-sm"><Loader2 className="size-4 animate-spin"/>{t('agent.working')}</p>}
   {error&&<p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
   {run&&<section className="space-y-4">
    <div className="border-s-2 border-primary ps-3"><p className="text-xs text-muted-foreground">{t(`agent.areas.${run.input.scope.area}`)} · {new Date(run.createdAt).toLocaleString(i18n.language)} · {t(`agent.states.${run.state}`)}</p><p className="mt-1 text-sm font-medium whitespace-pre-wrap break-words">{run.input.prompt}</p></div>
    {run.error&&<p role="alert" className="text-sm text-destructive">{t(`agent.errors.${run.error}`,{defaultValue:t('agent.failed')})}</p>}
    {run.state==='running'&&<div className="flex gap-2"><Button variant="outline" onClick={()=>load(run.id)}>{t('agent.refresh')}</Button><Button variant="outline" onClick={async()=>{try{await axios.post(`/ai/agent/${run.id}/cancel`);await load(run.id);}catch(e){setError(failure(e));}}}>{t('agent.cancel')}</Button></div>}
    {run.result&&<><div className="whitespace-pre-wrap break-words text-sm leading-7">{run.result.answer}</div>
    {run.result.missing.length>0&&<div className="rounded-lg bg-muted/50 p-3"><h4 className="text-sm font-semibold">{t('agent.missing')}</h4><ul className="list-disc ps-5 text-sm space-y-1 mt-2">{run.result.missing.map((v,i)=><li key={i}>{v}</li>)}</ul></div>}
    <div className="space-y-2"><h4 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">{t('agent.sources')}</h4><div className="flex flex-wrap gap-2">{run.sources.filter(s=>run.result!.citations.includes(s.key)).map(s=><Link key={s.key} to={s.href} className="inline-flex max-w-full items-center gap-1 rounded-md border px-2 py-1 text-xs text-primary hover:bg-primary/5"><span className="truncate">{s.title}</span><ArrowUpRight className="size-3 shrink-0"/></Link>)}</div><p className="text-xs text-muted-foreground">{t('agent.sampleNote')}</p></div>
    {actions.length>0&&run.state==='ready'&&<div className="space-y-3 border-t pt-4"><h3 className="font-semibold">{t('agent.review')}</h3>{actions.map((action,index)=><div key={index} className="rounded-xl border p-3 space-y-3"><label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={selected.includes(index)} disabled={applying} onChange={e=>{setSelected(prev=>e.target.checked?[...prev,index]:prev.filter(v=>v!==index));setConfirmed(false);setSharing(false);}}/>{t(`agent.actions.${action.type}`)}</label><ActionEditor action={edits[index]??action} run={run} index={index} disabled={applying} onChange={value=>{setEdits(prev=>({...prev,[index]:value}));setConfirmed(false);setSharing(false);}}/></div>)}
     <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={confirmed} disabled={applying} onChange={e=>setConfirmed(e.target.checked)}/>{t('agent.confirm')}</label>
     {needsSharing&&<label className="flex items-start gap-2 rounded-lg bg-primary/5 p-3 text-sm"><input type="checkbox" className="mt-1" checked={sharing} disabled={applying} onChange={e=>setSharing(e.target.checked)}/>{t('agent.confirmSharing')}</label>}
     <Button className="w-full" disabled={applying||!confirmed||!selected.length||(needsSharing&&!sharing)} onClick={apply}>{applying?<Loader2 className="size-4 animate-spin"/>:<Check className="size-4"/>}{t('agent.apply',{count:selected.length})}</Button>
    </div>}
    </>}
    {run.receipts.length>0&&<div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2"><h3 className="font-semibold">{t('agent.executed')}</h3>{run.receipts.map((receipt,i)=><Link className="flex items-center gap-2 text-sm hover:underline" key={i} to={receipt.href}><Check className="size-4 shrink-0"/>{t(`agent.actions.${receipt.type}`)}: {receipt.title}</Link>)}</div>}
   </section>}
  </div>
  <div className="border-t bg-background p-4 space-y-3">
   <label htmlFor="agent-prompt" className="text-sm font-medium">{t('agent.request')}</label><Textarea id="agent-prompt" maxLength={8000} rows={3} value={prompt} disabled={busy||applying} onChange={e=>setPrompt(e.target.value)} placeholder={t('agent.placeholder')} onKeyDown={e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();if(!busy&&!applying&&!context.isError&&!context.isPending)void generate();}}}/>
   {canAuto&&<label className="flex items-start gap-2 text-xs text-muted-foreground"><input type="checkbox" className="mt-0.5" checked={automatic} disabled={busy||applying} onChange={e=>setAutomatic(e.target.checked)}/>{t('agent.automatic')}</label>}
   <div className="flex gap-2 justify-between items-center"><Link to={pathname.startsWith('/viewer')?'/viewer/ai-assistant':'/dashboard/ai-assist'} className="text-xs text-muted-foreground hover:underline">{t('agent.otherTools')}</Link>{busy?<Button variant="outline" onClick={cancel}><Square className="size-3"/>{t('agent.cancel')}</Button>:<Button onClick={generate} disabled={!prompt.trim()||applying||context.isPending||context.isError}><Sparkles className="size-4"/>{t('agent.generate')}</Button>}</div>
  </div>
 </div>;
}
function ActionEditor({action,run,index,disabled,onChange}:{action:AgentAction;run:AgentRun;index:number;disabled:boolean;onChange:(value:AgentAction)=>void}){
 const {t}=useTranslation();const resource='taskId'in action?action.taskId:'clientId'in action?action.clientId:action.projectId;
 const source=run.sources.find(s=>s.id===resource);const id=`agent-action-${index}`;
 return <fieldset disabled={disabled} className="space-y-2 min-w-0">
  <p className="text-xs text-muted-foreground break-words">{source?.title??resource}</p>
  {'title'in action&&<label className="block text-xs">{t('agent.title')}<Input className="mt-1" value={action.title} maxLength={160} onChange={e=>onChange({...action,title:e.target.value})}/></label>}
  {'description'in action&&<label className="block text-xs">{t('agent.description')}<Textarea className="mt-1" value={action.description} maxLength={4000} onChange={e=>onChange({...action,description:e.target.value})}/></label>}
  {'assignedTo'in action&&<><label className="block text-xs" htmlFor={`${id}-assignee`}>{t('agent.assignee')}</label><select id={`${id}-assignee`} className={selectClass} value={action.assignedTo??''} onChange={e=>onChange({...action,assignedTo:e.target.value||null})}><option value="">{t('agent.unassigned')}</option>{run.members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select><div className="grid grid-cols-2 gap-2">{(['startDate','endDate'] as const).map(field=><label key={field} className="text-xs min-w-0">{t(`agent.${field}`)}<Input type="date" className="mt-1 max-w-full" value={action[field]??''} onChange={e=>onChange({...action,[field]:e.target.value||null})}/></label>)}</div></>}
  {action.type==='create_task'&&<label className="block text-xs">{t('agent.hours')}<Input className="mt-1" type="number" min={0} max={10000} step="0.25" value={action.estimatedHours??''} onChange={e=>onChange({...action,estimatedHours:e.target.value===''?null:Number(e.target.value)})}/></label>}
  {action.type==='followup'&&<><label className="block text-xs">{t('agent.followupDate')}<Input className="mt-1" value={action.date} onChange={e=>onChange({...action,date:e.target.value})}/></label><label className="block text-xs">{t('agent.note')}<Textarea className="mt-1" value={action.note} maxLength={2000} onChange={e=>onChange({...action,note:e.target.value})}/></label></>}
  {action.type==='client_request'&&<label className="block text-xs">{t('agent.questions')}<Textarea className="mt-1" value={action.questions.join('\n')} onChange={e=>onChange({...action,questions:e.target.value.split('\n').filter(Boolean)})}/></label>}
 </fieldset>;
}
