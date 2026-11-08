import { cleanup,render,screen,waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach,beforeEach,expect,it,vi } from 'vitest';
import { VoiceButton } from './VoiceButton';
const api=vi.hoisted(()=>({post:vi.fn()}));
vi.mock('@/configs/axios.config',()=>({axios:api}));
vi.mock('react-i18next',()=>({useTranslation:()=>({t:(key:string,opts?:{seconds?:number})=>opts?.seconds!==undefined?`${key}:${opts.seconds}`:key})}));

const track={stop:vi.fn()};
class FakeRecorder{static isTypeSupported=(type:string)=>type==='audio/webm;codecs=opus';state='inactive';mimeType:string;ondataavailable?:(e:{data:Blob})=>void;onstop?:()=>void;
 constructor(_stream:unknown,options?:{mimeType:string}){this.mimeType=options?.mimeType??'';}
 start(){this.state='recording';}
 stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['voice'],{type:this.mimeType})});this.onstop?.();}
}
const getUserMedia=vi.fn();
beforeEach(()=>{vi.clearAllMocks();vi.stubGlobal('MediaRecorder',FakeRecorder);Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia}});getUserMedia.mockResolvedValue({getTracks:()=>[track]});});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});

it('records a voice note, uploads it once and hands back the transcript for review',async()=>{
 api.post.mockResolvedValue({data:{data:{text:'Create a task to call Ana'}}});const onText=vi.fn(),onError=vi.fn();
 render(<VoiceButton onText={onText} onError={onError}/>);
 await userEvent.click(screen.getByRole('button',{name:'agent.voice.start'}));
 expect(screen.getByRole('status').textContent).toBe('agent.voice.recording:0');
 await userEvent.click(screen.getByRole('button',{name:'agent.voice.stop'}));
 await waitFor(()=>expect(onText).toHaveBeenCalledWith('Create a task to call Ana'));
 expect(api.post).toHaveBeenCalledTimes(1);const [url,form]=api.post.mock.calls[0];
 expect(url).toBe('/ai/agent/transcribe');const file=(form as FormData).get('audio') as File;
 expect(file.name).toBe('voice.webm');expect(file.type).toBe('audio/webm;codecs=opus');
 expect(track.stop).toHaveBeenCalled();expect(onError).not.toHaveBeenCalled();
 expect(screen.getByRole('button',{name:'agent.voice.start'})).toBeTruthy();
});

it('reports a blocked microphone without uploading anything',async()=>{
 getUserMedia.mockRejectedValue(new Error('NotAllowedError'));const onError=vi.fn();
 render(<VoiceButton onText={vi.fn()} onError={onError}/>);
 await userEvent.click(screen.getByRole('button',{name:'agent.voice.start'}));
 expect(onError).toHaveBeenCalledWith({response:{data:{code:'MIC_DENIED'}}});expect(api.post).not.toHaveBeenCalled();
});

it('passes a transcription failure on and is ready to record again',async()=>{
 const error={response:{data:{code:'NO_SPEECH'}}};api.post.mockRejectedValue(error);const onText=vi.fn(),onError=vi.fn();
 render(<VoiceButton onText={onText} onError={onError}/>);
 await userEvent.click(screen.getByRole('button',{name:'agent.voice.start'}));
 await userEvent.click(screen.getByRole('button',{name:'agent.voice.stop'}));
 await waitFor(()=>expect(onError).toHaveBeenCalledWith(error));
 expect(onText).not.toHaveBeenCalled();expect(screen.getByRole('button',{name:'agent.voice.start'})).toBeTruthy();
});

it('stays hidden in browsers that cannot record',()=>{
 vi.stubGlobal('MediaRecorder',undefined);
 const {container}=render(<VoiceButton onText={vi.fn()} onError={vi.fn()}/>);
 expect(container.innerHTML).toBe('');
});
