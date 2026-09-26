export const agentAreas = ['dashboard','projects','tasks','clients','leads','proposals','scope','pending','capacity','financial','time','calendar','documents','attention','settings','support'] as const;
export type AgentArea = typeof agentAreas[number];
export type AgentScope = { area: AgentArea; projectId?: string; clientId?: string };
export const OPEN_AGENT_EVENT='flowlio-open-agent';
export function openAgentContext(scope:AgentScope,prompt?:string){window.dispatchEvent(new CustomEvent(OPEN_AGENT_EVENT,{detail:{scope,prompt}}));}
export function agentScopeForPath(path: string): AgentScope {
  const project = path.match(/^\/dashboard\/project\/(?:view|edit)\/([^/]+)/) ?? path.match(/^\/viewer\/projects\/([^/]+)/);
  const client = path.match(/^\/dashboard\/client-management\/([^/]+)/);
  let area: AgentArea = 'dashboard';
  if (path.includes('profitability') || /\/(invoice|payment-links)(\/|$)/.test(path)) area = 'financial';
  else if (path.endsWith('/changes')) area = 'scope';
  else if (path.endsWith('/pending')) area = 'pending';
  else if (path.includes('team-capacity') || path.includes('user-management')) area = 'capacity';
  else if (path.includes('client-management')) area = 'clients';
  else if (path.includes('leads')) area = 'leads';
  else if (path.includes('proposals')) area = 'proposals';
  else if (path.includes('task')) area = 'tasks';
  else if (path.includes('project')) area = 'projects';
  else if (path.includes('time-tracking')) area = 'time';
  else if (/calend[ae]r/.test(path)) area = 'calendar';
  else if (path.includes('media-center')) area = 'documents';
  else if (path.includes('attention')) area = 'attention';
  else if (path.includes('support')) area = 'support';
  else if (path.includes('settings')) area = 'settings';
  return { area, ...(project ? { projectId: decodeURIComponent(project[1]) } : {}), ...(client ? { clientId: decodeURIComponent(client[1]) } : {}) };
}
export type AgentAction =
  | {type:'create_task';projectId:string;title:string;description:string;assignedTo:string|null;startDate:string|null;endDate:string|null;estimatedHours:number|null}
  | {type:'plan_task';taskId:string;assignedTo:string|null;startDate:string|null;endDate:string|null}
  | {type:'followup';clientId:string;date:string;note:string}
  | {type:'client_request';projectId:string;title:string;description:string;questions:string[]};
export type AgentSource = {key:string;kind:string;id:string;title:string;href:string};
export type AgentRun = {id:string;state:string;createdAt:string;input:{scope:AgentScope;prompt:string;mode:string};error?:string;result?:{answer:string;citations:string[];missing:string[];actions:AgentAction[]};receipts:{type:string;id:string;title:string;href:string}[];sources:AgentSource[];members:{id:string;name:string}[];limits:string[]};
export const canUseAgent = (user?: {role?:string;organizationId?:string} | null) => !!user?.organizationId && ['user','operator','viewer','subadmin','superadmin'].includes(user.role ?? '');
