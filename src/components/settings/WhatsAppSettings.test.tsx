import { cleanup,render,screen,waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach,beforeEach,expect,it,vi } from 'vitest';
import { QueryClient,QueryClientProvider } from '@tanstack/react-query';
import { WhatsAppSettings } from './WhatsAppSettings';
const api=vi.hoisted(()=>({get:vi.fn(),post:vi.fn(),delete:vi.fn()}));
vi.mock('@/configs/axios.config',()=>({axios:api}));
vi.mock('react-i18next',()=>({useTranslation:()=>({i18n:{language:'pt-BR'},t:(key:string,opts:Record<string,unknown>={})=>`${key}${Object.keys(opts).length?JSON.stringify(opts):''}`})}));
const wrap=()=>render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><WhatsAppSettings/></QueryClientProvider>);
const expiresAt=()=>new Date(Date.now()+15*60000).toISOString();
beforeEach(()=>vi.clearAllMocks());
afterEach(cleanup);

it('creates a one-time code, links straight to WhatsApp with it and shows the number once connected',async()=>{
 let status:Record<string,unknown>={configured:true,number:'15551874420',linked:null,pending:null};
 api.get.mockImplementation(async()=>({data:{data:status}}));
 api.post.mockResolvedValue({data:{data:{configured:true,number:'15551874420',linked:null,code:'ABCD-EFGH',pending:{expiresAt:expiresAt()}}}});
 wrap();
 await userEvent.click(await screen.findByRole('button',{name:'whatsappLio.connect'}));
 expect(api.post).toHaveBeenCalledWith('/whatsapp/link',{language:'pt'});
 expect(screen.getByText('FLOWLIO ABCD-EFGH')).toBeTruthy();
 expect(screen.getByRole('link',{name:'whatsappLio.open'}).getAttribute('href')).toBe('https://wa.me/15551874420?text=FLOWLIO%20ABCD-EFGH');
 expect(screen.getByRole('status').textContent).toBe('whatsappLio.waiting{"count":15}');
 status={...status,linked:{phone:'+972 •••• 4567',since:'2026-11-08T10:00:00Z'}};
 await waitFor(()=>expect(screen.getByText('whatsappLio.connected{"phone":"+972 •••• 4567"}')).toBeTruthy(),{timeout:5000});
 expect(screen.queryByText('FLOWLIO ABCD-EFGH')).toBeNull();
});

it('disconnects a linked number',async()=>{
 api.get.mockResolvedValue({data:{data:{configured:true,number:'15551874420',linked:{phone:'+972 •••• 4567',since:'2026-11-08T10:00:00Z'},pending:null}}});
 api.delete.mockResolvedValue({data:{data:{configured:true,number:'15551874420',linked:null,pending:null}}});
 wrap();
 await userEvent.click(await screen.findByRole('button',{name:'whatsappLio.disconnect'}));
 expect(api.delete).toHaveBeenCalledWith('/whatsapp/link');
 expect(await screen.findByRole('button',{name:'whatsappLio.connect'})).toBeTruthy();
});

it('stays hidden when WhatsApp is not set up or the user cannot use Lio',async()=>{
 api.get.mockResolvedValueOnce({data:{data:{configured:false}}});
 const first=wrap();await waitFor(()=>expect(api.get).toHaveBeenCalled());expect(first.container.innerHTML).toBe('');first.unmount();
 api.get.mockRejectedValueOnce({response:{status:403}});
 const second=wrap();await waitFor(()=>expect(api.get).toHaveBeenCalledTimes(2));await new Promise(r=>setTimeout(r,0));expect(second.container.innerHTML).toBe('');
});
