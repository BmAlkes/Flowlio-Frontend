import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Mic, Square } from 'lucide-react';
import { axios } from '@/configs/axios.config';
import { Button } from '@/components/ui/button';

const MAX_SECONDS=120;
const TYPES=['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg;codecs=opus'];
const supported=()=>typeof window!=='undefined'&&typeof MediaRecorder!=='undefined'&&!!navigator.mediaDevices?.getUserMedia;
// Errors carry the same shape as API failures so the agent shows them with its own messages.
const failure=(code:string)=>({response:{data:{code}}});

// Records a short voice note and hands back its transcript; the user reviews it before sending.
export function VoiceButton({disabled,onText,onError}:{disabled?:boolean;onText:(text:string)=>void;onError:(e:unknown)=>void}){
 const {t}=useTranslation();
 const [state,setState]=useState<'idle'|'recording'|'transcribing'>('idle'),[seconds,setSeconds]=useState(0);
 const recorder=useRef<MediaRecorder|null>(null);const upload=useRef<AbortController|null>(null);const timer=useRef<number>();const discard=useRef(false);
 useEffect(()=>()=>{discard.current=true;window.clearInterval(timer.current);if(recorder.current?.state==='recording')recorder.current.stop();upload.current?.abort();},[]);
 if(!supported())return null;
 async function send(blob:Blob){
  if(!blob.size){onError(failure('AUDIO_EMPTY'));setState('idle');return;}
  setState('transcribing');const controller=new AbortController();upload.current=controller;
  const form=new FormData();form.append('audio',blob,`voice.${blob.type.includes('mp4')?'m4a':blob.type.includes('ogg')?'ogg':'webm'}`);
  try{const text=(await axios.post<{data:{text:string}}>('/ai/agent/transcribe',form,{signal:controller.signal,timeout:90000})).data.data.text;if(!controller.signal.aborted)onText(text);}
  catch(e){if(!controller.signal.aborted)onError(e);}
  finally{if(upload.current===controller){upload.current=null;setState('idle');}}
 }
 async function start(){
  let stream:MediaStream;
  try{stream=await navigator.mediaDevices.getUserMedia({audio:true});}catch{onError(failure('MIC_DENIED'));return;}
  if(discard.current){stream.getTracks().forEach(track=>track.stop());return;}
  const mimeType=TYPES.find(type=>MediaRecorder.isTypeSupported(type));
  const media=new MediaRecorder(stream,mimeType?{mimeType}:undefined);const chunks:Blob[]=[];
  media.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  media.onstop=()=>{stream.getTracks().forEach(track=>track.stop());window.clearInterval(timer.current);recorder.current=null;if(discard.current)return;void send(new Blob(chunks,{type:media.mimeType||mimeType||'audio/webm'}));};
  recorder.current=media;media.start();setSeconds(0);setState('recording');
  const began=Date.now();timer.current=window.setInterval(()=>{const elapsed=Math.floor((Date.now()-began)/1000);setSeconds(elapsed);if(elapsed>=MAX_SECONDS)media.stop();},250);
 }
 const stop=()=>{if(recorder.current?.state==='recording')recorder.current.stop();};
 return <>
  {state!=='idle'&&<span className="ai-voice-status" role="status">{state==='recording'?t('agent.voice.recording',{seconds}):t('agent.voice.transcribing')}</span>}
  {state==='recording'?<Button type="button" size="icon" className="ai-voice is-recording" aria-label={t('agent.voice.stop')} onClick={stop}><Square className="size-3.5"/></Button>
   :<Button type="button" size="icon" variant="ghost" className="ai-voice" aria-label={t('agent.voice.start')} title={t('agent.voice.start')} disabled={disabled||state==='transcribing'} onClick={()=>void start()}>{state==='transcribing'?<Loader2 className="size-4 animate-spin"/>:<Mic className="size-4"/>}</Button>}
 </>;
}
