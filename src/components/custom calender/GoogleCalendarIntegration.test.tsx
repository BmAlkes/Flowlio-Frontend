import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {describe,it,expect,vi,beforeEach} from 'vitest';
import en from '@/locales/en.json';

const api=vi.hoisted(()=>({status:{} as Record<string,unknown>,connected:true,posts:[] as string[],get:vi.fn(),post:vi.fn(),delete:vi.fn()}));
vi.mock('@/configs/axios.config',()=>({axios:api}));
vi.mock('/dashboard/google-calendar.svg',()=>({default:'icon.svg'}));
vi.mock('react-i18next',()=>({useTranslation:()=>({i18n:{language:'en'},t:(key:string,opts:Record<string,string>={})=>{let value:any=key.split('.').reduce<any>((v,k)=>v?.[k],en)??key;for(const [k,v]of Object.entries(opts))value=String(value).split(`{{${k}}}`).join(v);return value;}})}));
import {GoogleCalendarIntegration,syncedAgo} from './GoogleCalendarIntegration';

const renderPanel=()=>render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><GoogleCalendarIntegration/></QueryClientProvider>);

describe('Google Calendar panel',()=>{
 beforeEach(()=>{
  api.connected=true;api.posts=[];api.status={isRunning:false,lastSyncedAt:new Date(Date.now()-3*60000).toISOString(),lastError:null,live:true};
  api.get.mockImplementation(async(url:string)=>({data:{data:url.endsWith('/auth/status')?{isConnected:api.connected}:api.status}}));
  api.post.mockImplementation(async(url:string)=>{api.posts.push(url);return{data:{success:true}};});
 });

 it('syncs once when it opens, shows when it last synced and offers a single sync button',async()=>{
  renderPanel();
  expect(await screen.findByText('Synced 3 minutes ago')).toBeTruthy();
  expect(screen.getByText(en.calendar.google.live)).toBeTruthy();
  await waitFor(()=>expect(api.posts).toEqual(['/google-calendar/sync/force']));
  for(const old of ['Full Sync','Import Events','Force Sync Now'])expect(screen.queryByText(old)).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:/Sync now/}));
  await waitFor(()=>expect(api.posts).toHaveLength(2));
 });

 it('says when the last sync failed and when syncing is still in progress',async()=>{
  api.status={...api.status,lastError:'SYNC_FAILED'};
  const {unmount}=renderPanel();
  expect(await screen.findByText(en.calendar.google.failed)).toBeTruthy();
  unmount();
  api.status={...api.status,lastError:null,isRunning:true};
  renderPanel();
  expect(await screen.findByText(en.calendar.google.syncing)).toBeTruthy();
  expect((screen.getByRole('button',{name:/Sync now/}) as HTMLButtonElement).disabled).toBe(true);
 });

 it('only offers to connect when Google Calendar is not connected, without syncing',async()=>{
  api.connected=false;
  renderPanel();
  expect(await screen.findByRole('button',{name:en.calendar.google.connect})).toBeTruthy();
  expect(api.posts).toEqual([]);
 });

 it('describes the last sync in the reader language',()=>{
  const now=Date.parse('2026-11-07T12:00:00Z');
  expect(syncedAgo('2026-11-07T12:00:00Z','en',now)).toBe('now');
  expect(syncedAgo('2026-11-07T11:57:00Z','pt',now)).toBe('há 3 minutos');
  expect(syncedAgo('2026-11-07T10:00:00Z','en',now)).toBe('2 hours ago');
 });
});
