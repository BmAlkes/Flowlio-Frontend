import {render,screen,waitFor,cleanup,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {MemoryRouter,Routes,Route} from 'react-router';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {AgentTools} from './AgentTools';
import {AgentReports} from './AgentReports';
import {AgentContentHistory} from './AgentContentHistory';
import {GlobalAgent} from './GlobalAgent';
import {AiAssistPage} from '@/pages/aiassist.page';
import agent from '@/locales/agent/en.json';
import workspace from '@/locales/workspace/en.json';
import {useAiAssistChatStore} from '@/store/aiassistchat.store';

const api=vi.hoisted(()=>({post:vi.fn(),get:vi.fn(),createClient:vi.fn(),createProject:vi.fn(),role:'user'}));
vi.mock('@/configs/axios.config',()=>({axios:api}));
vi.mock('@/providers/user.provider',()=>({useUser:()=>({data:{user:{id:'owner',role:api.role,organizationId:'org',isOrganizationOwner:api.role==='user'}}})}));
vi.mock('@/hooks/useDataScope',()=>({useDataScope:()=> 'owner:org'}));
vi.mock('@/hooks/usePlanAccess',()=>({useHasFeatureAccess:()=>({data:{data:{hasAccess:true}},isLoading:false})}));
vi.mock('@/hooks/usecreateclient',()=>({useCreateClient:()=>({mutateAsync:api.createClient})}));
vi.mock('@/hooks/usecreateproject',()=>({useCreateProject:()=>({mutateAsync:api.createProject})}));
vi.mock('./aiassistchat',()=>({AiAssistChat:()=> <p>Content editor</p>}));
vi.mock('react-i18next',()=>({useTranslation:()=>({i18n:{language:'en',dir:()=> 'ltr'},t:(key:string,options:Record<string,unknown>={})=>{let v:any=key.split('.').reduce<any>((o,k)=>o?.[k],{agent,...workspace});v=typeof v==='string'?v:options.defaultValue??key;for(const[k,value]of Object.entries(options))v=String(v).split(`{{${k}}}`).join(String(value));return v;}})}));
const cache:QueryClient[]=[];
const saved=new Map<string,string>();
const storage={getItem:(key:string)=>saved.get(key)??null,setItem:(key:string,value:string)=>{saved.set(key,value);},removeItem:(key:string)=>{saved.delete(key);},clear:()=>saved.clear()};
function setup(element=<AgentTools contentOpen={0} onAssistant={vi.fn()} onHistory={vi.fn()}/>,path='/dashboard'){
 const client=new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}});cache.push(client);
 render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[path]}>{element}</MemoryRouter></QueryClientProvider>);return userEvent.setup();
}
beforeEach(()=>{vi.clearAllMocks();api.role='user';vi.stubGlobal('localStorage',storage);storage.clear();useAiAssistChatStore.getState().clearUserSession();useAiAssistChatStore.getState().setUserId('owner');api.post.mockResolvedValue({data:{data:{response:JSON.stringify({name:'Acme',email:'acme@example.test'})}}});api.get.mockResolvedValue({data:{data:{sources:[],members:[],capabilities:[]}}});api.createClient.mockResolvedValue({data:{id:'client',name:'Acme'}});});
afterEach(()=>{cleanup();cache.splice(0).forEach(c=>c.clear());});
it('opening tools never generates content and readonly staff cannot create records',()=>{api.role='viewer';setup();expect(screen.queryByRole('button',{name:/Create client/})).not.toBeInTheDocument();expect(screen.queryByRole('button',{name:/Create project/})).not.toBeInTheDocument();expect(api.post).not.toHaveBeenCalled();});
it('client creation requires a reviewed local password and does not send it to the model',async()=>{
 const user=setup();await user.click(screen.getByRole('button',{name:/Create client/}));await user.type(screen.getByLabelText(workspace.hub.describe),'Acme, acme@example.test');await user.click(screen.getByRole('button',{name:agent.generate}));
 const dialog=within(await screen.findByRole('dialog'));const apply=dialog.getByRole('button',{name:'Execute 1 selected actions'});await user.click(dialog.getByLabelText(agent.confirm));expect(apply).toBeDisabled();expect(api.createClient).not.toHaveBeenCalled();
 await user.type(dialog.getByLabelText(agent.fields.password),'PrivatePass!12');expect(apply).toBeDisabled();await user.click(dialog.getByLabelText(agent.confirm));await user.click(apply);
 await waitFor(()=>expect(api.createClient).toHaveBeenCalledWith(expect.objectContaining({name:'Acme',password:'PrivatePass!12'})));expect(JSON.stringify(api.post.mock.calls)).not.toContain('PrivatePass!12');expect(await screen.findByRole('link',{name:'Acme'})).toHaveAttribute('href','/dashboard/client-management/client');expect(localStorage.getItem('ai_chats_owner')).not.toContain('PrivatePass!12');
});
it('invalid model data cannot create a client and a failed save keeps the draft for correction',async()=>{
 const user=setup();api.post.mockResolvedValueOnce({data:{data:{response:'not json'}}});await user.click(screen.getByRole('button',{name:/Create client/}));await user.type(screen.getByLabelText(workspace.hub.describe),'Acme');await user.click(screen.getByRole('button',{name:agent.generate}));expect(await screen.findByRole('alert')).toHaveTextContent(workspace.hub.generateError);expect(api.createClient).not.toHaveBeenCalled();
 await user.click(screen.getByRole('button',{name:agent.generate}));const dialog=within(await screen.findByRole('dialog'));await user.type(dialog.getByLabelText(agent.fields.password),'PrivatePass!12');await user.click(dialog.getByLabelText(agent.confirm));api.createClient.mockRejectedValueOnce(Error('Denied'));await user.click(dialog.getByRole('button',{name:'Execute 1 selected actions'}));expect(await dialog.findByRole('alert')).toHaveTextContent(workspace.hub.saveError);expect(dialog.getByLabelText(agent.fields.password)).toHaveValue('PrivatePass!12');
});
it('old AI bookmarks open the same top-bar workspace and retain client exclusion',async()=>{
 setup(<Routes><Route path="/dashboard/ai-assist" element={<AiAssistPage/>}/><Route path="/dashboard" element={<GlobalAgent/>}/></Routes>,'/dashboard/ai-assist');
 expect(await screen.findByRole('tab',{name:workspace.hub.tools})).toHaveAttribute('aria-selected','true');expect(screen.getAllByRole('dialog')).toHaveLength(1);expect(api.post).not.toHaveBeenCalled();
});
it('client routes cannot open tools or trigger generation',()=>{api.role='client';setup(<><AiAssistPage/><GlobalAgent/></>,'/clients');expect(screen.queryByRole('dialog')).not.toBeInTheDocument();expect(api.get).not.toHaveBeenCalled();expect(api.post).not.toHaveBeenCalled();});
it('weekly reports only consume AI after an explicit request and do not retry failures',async()=>{
 const user=setup(<AgentReports kind="weekly"/>);expect(api.get).not.toHaveBeenCalled();api.get.mockRejectedValueOnce(Error('Unavailable'));await user.click(screen.getByRole('button',{name:agent.generate}));expect(await screen.findByRole('alert')).toHaveTextContent(agent.failed);expect(api.get).toHaveBeenCalledTimes(1);
 api.get.mockResolvedValueOnce({data:{success:true,data:{period:{start:'2026-09-21',end:'2026-09-27'},summary:'Weekly delivery review',highlights:['Review complete'],recommendations:[],metrics:{totalProjects:2,completedTasks:3,totalHours:10,billableHours:8},projectBreakdown:[]}}});await user.click(screen.getByRole('button',{name:agent.generate}));expect(await screen.findByText('Weekly delivery review')).toBeInTheDocument();expect(api.get).toHaveBeenLastCalledWith('/ai/weekly-summary',expect.objectContaining({timeout:120000}));
});
it('content history keeps rename and confirmed deletion without changing workspace records',async()=>{
 const id=useAiAssistChatStore.getState().addChat({title:'Draft content',messages:[]});const user=setup(<AgentContentHistory onOpen={vi.fn()}/>);await user.click(screen.getByRole('button',{name:'Rename: Draft content'}));const dialog=within(screen.getByRole('dialog'));await user.clear(dialog.getByLabelText(agent.title));await user.type(dialog.getByLabelText(agent.title),'Launch copy');await user.click(dialog.getByRole('button',{name:'Rename'}));expect(JSON.parse(localStorage.getItem('ai_chats_owner')!)[0].title).toBe('Launch copy');
 await user.click(screen.getByRole('button',{name:'Delete: Launch copy'}));expect(useAiAssistChatStore.getState().chats[0].id).toBe(id);await user.click(within(screen.getByRole('dialog')).getByRole('button',{name:'Delete'}));await waitFor(()=>expect(useAiAssistChatStore.getState().chats).toHaveLength(0));expect(api.post).not.toHaveBeenCalled();
});
