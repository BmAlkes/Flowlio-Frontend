import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/providers/user.provider';
import { canUseAgent,openAgentContext,type AgentScope } from './agent-context';
export function AgentContextButton({scope,prompt,onOpen}:{scope:AgentScope;prompt?:string;onOpen?:()=>void}){
 const {data}=useUser();if(!canUseAgent(data?.user))return null;
 return <Button variant="outline" size="sm" className="gap-2 text-primary" onClick={()=>{onOpen?.();requestAnimationFrame(()=>openAgentContext(scope,prompt));}}><Sparkles className="size-4"/>Flowlio AI</Button>;
}
