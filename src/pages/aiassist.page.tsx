import { Navigate } from 'react-router';
import { useUser } from '@/providers/user.provider';
import { canUseAgent } from '@/components/ai assist/agent-context';

// Existing bookmarks and menu items open the same Flowlio AI workspace.
export const AiAssistPage = () => {
 const {data}=useUser();
 if(!canUseAgent(data?.user))return null;
 return <Navigate replace to={data?.user.role==='viewer'?'/viewer?ai=tools':'/dashboard?ai=tools'}/>;
};
