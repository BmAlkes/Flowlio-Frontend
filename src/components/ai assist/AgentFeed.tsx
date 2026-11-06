import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, Check, Loader2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AgentAnswer } from './AgentAnswer';
import { LioAvatar } from './LioAvatar';
import { taskStatuses, type AgentAction, type AgentRun, type TaskStatus } from './agent-context';

// datetime-local wants the local wall time without a zone
const toLocalInput=(iso:string)=>{const d=new Date(iso);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);};

export const selectClass='h-10 w-full rounded-md border border-input bg-background px-3 text-sm min-w-0';
export type ConfirmAction=(run:AgentRun,index:number,edit:AgentAction|null,share:boolean)=>Promise<boolean>;

// One question and Lio's answer, with its sources and proposed actions.
export function AgentTurn({run,latest,onConfirm,onRefresh,onCancel}:{run:AgentRun;latest:boolean;onConfirm:ConfirmAction;onRefresh:()=>void;onCancel:()=>void}){
 const {t,i18n}=useTranslation();const result=run.result;
 const cited=result?run.sources.filter(s=>result.citations.includes(s.key)):[];
 const legacy=run.state==='applied'&&!run.receipts.some(r=>Number.isInteger(r.index));
 const status=['running','failed','cancelled'].includes(run.state)?` · ${t(`agent.states.${run.state}`)}`:'';
 return <article className="ai-turn" aria-label={run.input.prompt}>
  <h3 className="ai-question">{run.input.prompt}</h3>
  <p className="ai-meta">{t(`agent.areas.${run.input.scope.area}`)} · {new Date(run.createdAt).toLocaleString(i18n.language,{dateStyle:'short',timeStyle:'short'})}{status}</p>
  <div className="ai-reply">
   <LioAvatar state={run.error?'error':run.state==='running'?'thinking':'happy'} size={26} className="ai-reply-mark"/>
   <div className="ai-reply-body">
    {run.error&&<p className="ai-turn-error">{t(`agent.errors.${run.error}`,{defaultValue:t('agent.failed')})}</p>}
    {run.state==='running'&&<div className="flex gap-2"><Button variant="outline" size="sm" onClick={onRefresh}>{t('agent.refresh')}</Button><Button variant="outline" size="sm" onClick={onCancel}>{t('agent.cancel')}</Button></div>}
    {result&&<>
     <div className="ai-answer"><AgentAnswer text={result.answer} sources={run.sources}/></div>
     {result.missing.length>0&&<div className="ai-missing"><h4>{t('agent.missing')}</h4><ul>{result.missing.map((v,i)=><li key={i}>{v}</li>)}</ul></div>}
     {cited.length>0&&<div className="ai-sources"><span className="ai-sources-label">{t('agent.sources')}</span>{cited.map(s=><Link key={s.key} to={s.href} className="ai-source-chip"><span className="truncate">{s.title}</span><ArrowUpRight className="size-3 shrink-0"/></Link>)}</div>}
     {result.actions.length>0&&<div className="ai-actions">{result.actions.map((action,index)=><ActionCard key={index} run={run} index={index} action={action} legacy={legacy} onConfirm={onConfirm}/>)}</div>}
     {latest&&<p className="ai-note">{t('agent.sampleNote')}</p>}
    </>}
    {legacy&&!result?.actions.length&&run.receipts.map((receipt,i)=><Link key={i} className="ai-action-link" to={receipt.href}><Check className="size-4"/>{t(`agent.actions.${receipt.type}`)}: {receipt.title}</Link>)}
   </div>
  </div>
 </article>;
}

// Edits the server would reject keep the confirm button off
const ready=(action:AgentAction)=>action.type==='create_event'?action.endHour>action.startHour&&!!action.title.trim()
 :action.type==='create_lead'?!!action.name.trim()&&/^\S+@\S+\.\S+$/.test(action.email.trim()):true;

function ActionCard({run,index,action,legacy,onConfirm}:{run:AgentRun;index:number;action:AgentAction;legacy:boolean;onConfirm:ConfirmAction}){
 const {t,i18n}=useTranslation();
 const [edit,setEdit]=useState<AgentAction|null>(null),[editing,setEditing]=useState(false),[share,setShare]=useState(false),[saving,setSaving]=useState(false);
 const current=edit??action;const receipt=run.receipts.find(r=>r.index===index);const done=!!receipt||legacy;
 const pending=run.state==='ready'&&!done;const sharing=current.type==='client_request';const label=t(`agent.actions.${current.type}`);
 const sourceTitle=(id:string)=>run.sources.find(s=>s.id===id)?.title;
 const day=(d:string|null)=>d?new Date(d.length===10?`${d}T00:00:00`:d).toLocaleDateString(i18n.language,{day:'numeric',month:'short'}):null;
 const person=(id:string|null)=>id?run.members.find(m=>m.id===id)?.name:null;
 const range=(a:string|null,b:string|null)=>a||b?[day(a),day(b)].filter(Boolean).join(' → '):null;
 const short=(text:string|null)=>text&&text.length>80?`${text.slice(0,80)}…`:text;
 const when=(iso:string)=>new Date(iso).toLocaleString(i18n.language,{dateStyle:'medium',timeStyle:'short'});
 const hour=(h:number)=>new Date(2000,0,1,h).toLocaleTimeString(i18n.language,{hour:'2-digit',minute:'2-digit'});
 const [title,meta]=((): [string,(string|null|undefined)[]]=>{switch(current.type){
  case 'create_task':return[current.title,[sourceTitle(current.projectId),person(current.assignedTo),range(current.startDate,current.endDate),current.estimatedHours!=null?`${current.estimatedHours} h`:null]];
  case 'plan_task':return[sourceTitle(current.taskId)??current.taskId,[person(current.assignedTo),range(current.startDate,current.endDate)]];
  case 'followup':return[sourceTitle(current.clientId)??current.clientId,[when(current.date),short(current.note)]];
  case 'client_request':return[current.title,[sourceTitle(current.projectId),current.questions.length?t('agent.questionsCount',{count:current.questions.length}):null]];
  case 'set_task_status':return[sourceTitle(current.taskId)??current.taskId,[`→ ${t(`agent.taskStatus.${current.status}`)}`]];
  case 'create_event':return[current.title,[day(current.date),`${hour(current.startHour)} – ${hour(current.endHour)}`,t(`agent.calendarTypes.${current.calendarType}`)]];
  case 'create_lead':return[current.name,[current.email,current.phone,current.businessIndustry,current.followUpAt?t('agent.followupOn',{date:when(current.followUpAt)}):null]];
  case 'log_time':return[sourceTitle(current.taskId)??current.taskId,[day(current.date),t('agent.duration',{hours:Math.floor(current.minutes/60),minutes:String(current.minutes%60).padStart(2,'0')}),short(current.description)]];
 }})();
 async function confirm(){setSaving(true);const ok=await onConfirm(run,index,edit,share);setSaving(false);if(ok)setEditing(false);}
 return <div className={`ai-action${done?' is-done':''}`}>
  <div className="ai-action-head"><span className="ai-action-type">{label}</span>{done&&<span className="ai-action-state"><Check className="size-3.5"/>{t('agent.actionDone')}</span>}</div>
  <p className="ai-action-title">{title}</p>
  {meta.some(Boolean)&&<p className="ai-action-meta">{meta.filter(Boolean).join(' · ')}</p>}
  {editing&&pending&&<ActionEditor action={current} run={run} index={index} disabled={saving} onChange={value=>{setEdit(value);setShare(false);}}/>}
  {pending&&sharing&&<label className="ai-action-share"><input type="checkbox" checked={share} disabled={saving} onChange={e=>setShare(e.target.checked)}/>{t('agent.confirmSharing')}</label>}
  {pending&&<div className="ai-action-buttons">
   <Button variant="ghost" size="sm" disabled={saving} aria-expanded={editing} onClick={()=>setEditing(v=>!v)}><Pencil className="size-3.5"/>{editing?t('agent.doneEditing'):t('agent.edit')}</Button>
   <Button size="sm" disabled={saving||(sharing&&!share)||!ready(current)} aria-label={`${t('agent.confirmAction')}: ${label}`} onClick={confirm}>{saving?<Loader2 className="size-3.5 animate-spin"/>:<Check className="size-3.5"/>}{t('agent.confirmAction')}</Button>
  </div>}
  {receipt&&<Link to={receipt.href} className="ai-action-link">{t('agent.open')}: {receipt.title}<ArrowUpRight className="size-3.5"/></Link>}
 </div>;
}

function ActionEditor({action,run,index,disabled,onChange}:{action:AgentAction;run:AgentRun;index:number;disabled:boolean;onChange:(value:AgentAction)=>void}){
 const {t}=useTranslation();const id=`agent-action-${index}`;
 return <fieldset disabled={disabled} className="ai-action-editor">
  {'title'in action&&<label className="block text-xs">{t('agent.title')}<Input className="mt-1" value={action.title} maxLength={160} onChange={e=>onChange({...action,title:e.target.value})}/></label>}
  {'description'in action&&<label className="block text-xs">{t('agent.description')}<Textarea className="mt-1" value={action.description} maxLength={action.type==='log_time'?500:action.type==='create_event'?2000:4000} onChange={e=>onChange({...action,description:e.target.value})}/></label>}
  {'assignedTo'in action&&<><label className="block text-xs" htmlFor={`${id}-assignee`}>{t('agent.assignee')}</label><select id={`${id}-assignee`} className={selectClass} value={action.assignedTo??''} onChange={e=>onChange({...action,assignedTo:e.target.value||null})}><option value="">{t('agent.unassigned')}</option>{run.members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select><div className="grid grid-cols-2 gap-2">{(['startDate','endDate'] as const).map(field=><label key={field} className="text-xs min-w-0">{t(`agent.${field}`)}<Input type="date" className="mt-1 max-w-full" value={action[field]??''} onChange={e=>onChange({...action,[field]:e.target.value||null})}/></label>)}</div></>}
  {action.type==='create_task'&&<label className="block text-xs">{t('agent.hours')}<Input className="mt-1" type="number" min={0} max={10000} step="0.25" value={action.estimatedHours??''} onChange={e=>onChange({...action,estimatedHours:e.target.value===''?null:Number(e.target.value)})}/></label>}
  {action.type==='followup'&&<><label className="block text-xs">{t('agent.followupDate')}<Input className="mt-1" value={action.date} onChange={e=>onChange({...action,date:e.target.value})}/></label><label className="block text-xs">{t('agent.note')}<Textarea className="mt-1" value={action.note} maxLength={2000} onChange={e=>onChange({...action,note:e.target.value})}/></label></>}
  {action.type==='client_request'&&<label className="block text-xs">{t('agent.questions')}<Textarea className="mt-1" value={action.questions.join('\n')} onChange={e=>onChange({...action,questions:e.target.value.split('\n').filter(Boolean)})}/></label>}
  {action.type==='set_task_status'&&<label className="block text-xs">{t('agent.status')}<select className={`${selectClass} mt-1`} value={action.status} onChange={e=>onChange({...action,status:e.target.value as TaskStatus})}>{taskStatuses.map(s=><option key={s} value={s}>{t(`agent.taskStatus.${s}`)}</option>)}</select></label>}
  {(action.type==='create_event'||action.type==='log_time')&&<label className="block text-xs">{t('agent.day')}<Input type="date" className="mt-1" value={action.date} onChange={e=>e.target.value&&onChange({...action,date:e.target.value})}/></label>}
  {action.type==='create_event'&&<><div className="grid grid-cols-2 gap-2">{(['startHour','endHour'] as const).map(field=><label key={field} className="text-xs min-w-0">{t(`agent.${field}`)}<select className={`${selectClass} mt-1`} value={action[field]} onChange={e=>onChange({...action,[field]:Number(e.target.value)})}>{Array.from({length:24},(_,h)=><option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>)}</select></label>)}</div>
   {action.endHour<=action.startHour&&<p className="text-xs text-destructive">{t('agent.hoursOrder')}</p>}
   <label className="block text-xs">{t('agent.calendarType')}<select className={`${selectClass} mt-1`} value={action.calendarType} onChange={e=>onChange({...action,calendarType:e.target.value as typeof action.calendarType})}>{(['meeting','education','personal'] as const).map(v=><option key={v} value={v}>{t(`agent.calendarTypes.${v}`)}</option>)}</select></label></>}
  {action.type==='log_time'&&<label className="block text-xs">{t('agent.minutes')}<Input type="number" className="mt-1" min={1} max={1440} step={5} value={action.minutes} onChange={e=>onChange({...action,minutes:Math.max(1,Math.min(1440,Math.round(Number(e.target.value)||1)))})}/></label>}
  {action.type==='create_lead'&&<>
   {(['name','email','phone','businessIndustry'] as const).map(field=><label key={field} className="block text-xs">{t(`agent.lead.${field}`)}<Input className="mt-1" type={field==='email'?'email':'text'} value={action[field]??''} maxLength={field==='email'?254:160} onChange={e=>onChange({...action,[field]:field==='name'||field==='email'?e.target.value:e.target.value||null})}/></label>)}
   <label className="block text-xs">{t('agent.followupDate')}<Input type="datetime-local" className="mt-1" value={action.followUpAt?toLocalInput(action.followUpAt):''} onChange={e=>onChange({...action,followUpAt:e.target.value?new Date(e.target.value).toISOString():null})}/></label>
   <label className="block text-xs">{t('agent.note')}<Textarea className="mt-1" value={action.note??''} maxLength={2000} onChange={e=>onChange({...action,note:e.target.value||null})}/></label></>}
 </fieldset>;
}
