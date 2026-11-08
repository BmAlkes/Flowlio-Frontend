import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ExternalLink, Loader2, MessageCircle } from 'lucide-react';
import { axios } from '@/configs/axios.config';
import { Button } from '@/components/ui/button';

type Status={configured:boolean;number?:string|null;linked?:{phone:string;since:string}|null;pending?:{expiresAt:string}|null;code?:string};
const KEY=['whatsapp-link'];

// Links the user's own WhatsApp number to Lio: the user sends a one-time code from that number.
export function WhatsAppSettings(){
 const {t,i18n}=useTranslation();const cache=useQueryClient();
 const [code,setCode]=useState<{value:string;expiresAt:string}|null>(null);const [now,setNow]=useState(()=>Date.now());
 const waiting=!!code&&new Date(code.expiresAt).getTime()>now;
 const status=useQuery({queryKey:KEY,queryFn:async()=>(await axios.get<{data:Status}>('/whatsapp/link')).data.data,retry:false,refetchInterval:waiting?3000:false});
 const linked=status.data?.linked;
 useEffect(()=>{if(linked)setCode(null);},[linked]);
 useEffect(()=>{if(!code)return;const timer=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(timer);},[code]);
 const start=useMutation({mutationFn:async()=>(await axios.post<{data:Status}>('/whatsapp/link',{language:i18n.language.split('-')[0]})).data.data,
  onSuccess:data=>{if(data.code&&data.pending){setNow(Date.now());setCode({value:data.code,expiresAt:data.pending.expiresAt});}cache.setQueryData(KEY,data);}});
 const unlink=useMutation({mutationFn:async()=>(await axios.delete<{data:Status}>('/whatsapp/link')).data.data,onSuccess:data=>{setCode(null);cache.setQueryData(KEY,data);}});
 // Hidden when WhatsApp is not set up on the server or the user cannot use Lio.
 if(status.isError||!status.data?.configured)return null;
 const number=status.data.number?`+${status.data.number}`:null;const message=code?`FLOWLIO ${code.value}`:'';
 const minutes=code?Math.max(0,Math.ceil((new Date(code.expiresAt).getTime()-now)/60000)):0;
 return <section className="my-4 rounded-xl border bg-card p-5 space-y-4" aria-labelledby="whatsapp-lio-title">
  <div className="flex items-start gap-3">
   <span className="mt-0.5 rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400" aria-hidden="true"><MessageCircle className="size-5"/></span>
   <div><h2 id="whatsapp-lio-title" className="font-semibold">{t('whatsappLio.title')}</h2><p className="text-sm text-muted-foreground mt-1 max-w-2xl">{t('whatsappLio.description')}</p></div>
  </div>
  {linked?<div className="space-y-3">
   <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="size-4"/>{t('whatsappLio.connected',{phone:linked.phone})}</p>
   <p className="text-sm text-muted-foreground max-w-2xl">{t('whatsappLio.howTo',{number:number??''})}</p>
   <Button variant="outline" size="sm" className="text-rose-600 hover:text-rose-700" disabled={unlink.isPending} onClick={()=>unlink.mutate()}>{unlink.isPending&&<Loader2 className="size-3.5 me-2 animate-spin"/>}{t('whatsappLio.disconnect')}</Button>
  </div>:waiting&&code?<div className="space-y-3">
   <p className="text-sm">{t('whatsappLio.sendCode',{number:number??t('whatsappLio.theNumber')})}</p>
   <p className="w-fit rounded-lg border bg-muted px-4 py-3 font-mono text-lg font-semibold tracking-wider select-all" dir="ltr">{message}</p>
   <div className="flex flex-wrap items-center gap-2">
    {number&&<Button asChild size="sm"><a href={`https://wa.me/${status.data.number}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer"><ExternalLink className="size-3.5 me-2"/>{t('whatsappLio.open')}</a></Button>}
    <span role="status" className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="size-3.5 animate-spin"/>{t('whatsappLio.waiting',{count:minutes})}</span>
   </div>
  </div>:<div className="space-y-2">
   {code&&<p role="alert" className="text-sm text-muted-foreground">{t('whatsappLio.expired')}</p>}
   <Button size="sm" disabled={start.isPending} onClick={()=>start.mutate()}>{start.isPending&&<Loader2 className="size-3.5 me-2 animate-spin"/>}{t('whatsappLio.connect')}</Button>
   {(start.isError||unlink.isError)&&<p role="alert" className="text-sm text-destructive">{t('whatsappLio.failed')}</p>}
  </div>}
 </section>;
}
