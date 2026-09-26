import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Pencil,Trash2} from 'lucide-react';
import {useAiAssistChatStore} from '@/store/aiassistchat.store';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';

export function AgentContentHistory({onOpen}:{onOpen:(id:string)=>void}){
 const {t}=useTranslation();const store=useAiAssistChatStore();
 const [action,setAction]=useState<{kind:'rename'|'delete'|'clear';id?:string;title?:string}|null>(null),[title,setTitle]=useState(''),[failed,setFailed]=useState(false);
 const open=(value:NonNullable<typeof action>)=>{setAction(value);setTitle(value.title??'');setFailed(false);};
 async function apply(){if(!action)return;try{if(action.kind==='rename'&&action.id)store.editChatTitle(action.id,title.trim());else if(action.kind==='delete'&&action.id)await store.deleteChat(action.id);else if(action.kind==='clear')store.clearAllChats();const {userId,chats}=useAiAssistChatStore.getState();if(userId)localStorage.setItem(`ai_chats_${userId}`,JSON.stringify(chats));setAction(null);}catch{setFailed(true);}}
 return <section className="space-y-2"><div className="flex flex-wrap items-center justify-between gap-2"><h4 className="text-xs font-semibold text-muted-foreground">{t('hub.contentHistory')}</h4>{store.chats.length>0&&<Button size="sm" variant="ghost" disabled={store.isLoading} onClick={()=>open({kind:'clear'})}>{t('hub.clear')}</Button>}</div><p className="text-xs text-muted-foreground">{t('hub.historyNote')}</p>
 {[...store.chats].sort((a,b)=>new Date(b.updatedAt??0).getTime()-new Date(a.updatedAt??0).getTime()).map(chat=><div key={chat.id} className="flex items-center gap-1 rounded-lg border p-2"><button className="min-w-0 flex-1 break-words p-1 text-start text-sm hover:underline" disabled={store.isLoading} onClick={()=>onOpen(chat.id)}>{chat.title}</button><Button size="icon" variant="ghost" disabled={store.isLoading} aria-label={`${t('hub.rename')}: ${chat.title}`} onClick={()=>open({kind:'rename',id:chat.id,title:chat.title})}><Pencil className="size-4"/></Button><Button size="icon" variant="ghost" disabled={store.isLoading} aria-label={`${t('hub.delete')}: ${chat.title}`} onClick={()=>open({kind:'delete',id:chat.id,title:chat.title})}><Trash2 className="size-4"/></Button></div>)}
 <Dialog open={!!action} onOpenChange={v=>{if(!v)setAction(null);}}><DialogContent><DialogHeader><DialogTitle>{action&&t(`hub.${action.kind}`)}</DialogTitle><DialogDescription>{t('hub.localHistoryOnly')}</DialogDescription></DialogHeader>{action?.kind==='rename'?<label className="space-y-2 text-sm">{t('agent.title')}<Input value={title} maxLength={160} onChange={e=>setTitle(e.target.value)}/></label>:<p className="text-sm break-words">{action?.title??t('hub.clearConfirm')}</p>}{failed&&<p role="alert" className="text-sm text-destructive">{t('hub.saveError')}</p>}<div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setAction(null)}>{t('agent.cancel')}</Button><Button disabled={action?.kind==='rename'&&!title.trim()} onClick={()=>void apply()}>{action&&t(`hub.${action.kind}`)}</Button></div></DialogContent></Dialog>
 </section>;
}
