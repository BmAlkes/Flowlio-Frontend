import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router';
import type { AgentSource } from './agent-context';

// Answers are model output: render a tiny Markdown subset as React nodes (never HTML) and only
// link to records the server already authorized for this run.
const token=/\[\[([^\]]+)\]\]|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
const linkClass='text-primary underline underline-offset-2 hover:no-underline';

export function AgentAnswer({text,sources}:{text:string;sources:AgentSource[]}){
  const nodes:ReactNode[]=[];let last=0;
  for(const match of text.matchAll(token)){
    const at=match.index??0;if(at>last)nodes.push(text.slice(last,at));
    const [,key,label,url,bold]=match;
    if(key){
      const source=sources.find(s=>s.key===key.trim());
      if(source)nodes.push(<Link key={at} to={source.href} className={linkClass}>{source.title}</Link>);
    }else if(label){
      // Models sometimes JSON-escape slashes ("\/dashboard\/..."); compare the unescaped path.
      const href=url.replace(/\\\//g,'/');
      const source=sources.find(s=>s.href===href);
      nodes.push(source?<Link key={at} to={source.href} className={linkClass}>{label}</Link>:label);
    }else nodes.push(<strong key={at}>{bold}</strong>);
    last=at+match[0].length;
  }
  if(last<text.length)nodes.push(text.slice(last));
  return <>{nodes.map((node,i)=><Fragment key={i}>{node}</Fragment>)}</>;
}
