import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';
import { axios } from '@/configs/axios.config';
import { useDataScope } from '@/hooks/useDataScope';
import type { AgentSource } from './agent-context';
export type LegacyDraft={type:'task'|'client'|'project';data:Record<string,any>};
export function LegacyDraftReview({draft,onCancel,onApply}:{draft:LegacyDraft;onCancel:()=>void;onApply:(draft:LegacyDraft)=>Promise<void>}){
 const {t}=useTranslation();const [data,setData]=useState(draft.data),[confirm,setConfirm]=useState(false),[busy,setBusy]=useState(false);
 const scope=useDataScope();
 const options=useQuery({queryKey:['agent-legacy-options',scope],queryFn:async()=> (await axios.get<{data:{sources:AgentSource[];members:{id:string;name:string}[]}}>('/ai/agent/context',{params:{area:'projects'}})).data.data,enabled:draft.type==='task',retry:false});
 const fields=draft.type==='task'?['title','description','projectId','assignedTo','startDate','endDate','estimatedHours']:draft.type==='client'?['name','email','phone','password','businessIndustry','address']:['name','projectNumber','description','startDate','endDate','address'];
 return <Dialog open onOpenChange={open=>{if(!open&&!busy)onCancel();}}><DialogContent className="max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>{t('agent.review')}</DialogTitle><DialogDescription>{t('agent.legacyDescription')}</DialogDescription></DialogHeader>
  <fieldset disabled={busy} className="space-y-3">{fields.map(field=><label key={field} className="block text-sm">{t(field==='projectId'?'agent.project':field==='assignedTo'?'agent.assignee':`agent.fields.${field}`,{defaultValue:field})}{field==='projectId'||field==='assignedTo'?<select className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm" value={data[field]??''} onChange={e=>{setData({...data,[field]:e.target.value});setConfirm(false);}}><option value="">{t(field==='assignedTo'?'agent.unassigned':'agent.project')}</option>{(field==='projectId'?options.data?.sources.filter(s=>s.kind==='project').map(s=>({id:s.id,name:s.title})):options.data?.members)?.map(v=><option value={v.id} key={v.id}>{v.name}</option>)}</select>:field==='description'?<Textarea className="mt-1" value={data[field]??''} maxLength={4000} onChange={e=>{setData({...data,[field]:e.target.value});setConfirm(false);}}/>:<Input className="mt-1" type={field==='password'?'password':field==='estimatedHours'?'number':'text'} value={data[field]??''} onChange={e=>{setData({...data,[field]:field==='estimatedHours'?(e.target.value===''?undefined:Number(e.target.value)):e.target.value});setConfirm(false);}}/>}</label>)}
  <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={confirm} onChange={e=>setConfirm(e.target.checked)}/>{t('agent.confirm')}</label></fieldset>
  <div className="flex gap-2 justify-end"><Button variant="outline" disabled={busy} onClick={onCancel}>{t('agent.cancel')}</Button><Button disabled={busy||!confirm} onClick={async()=>{setBusy(true);try{await onApply({type:draft.type,data});onCancel();}finally{setBusy(false);}}}>{t('agent.apply',{count:1})}</Button></div>
 </DialogContent></Dialog>;
}
