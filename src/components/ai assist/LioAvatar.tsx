import './lio-avatar.css';

export type LioState='idle'|'thinking'|'happy'|'error';

// Lio, the assistant's robot head. The state only moves or dims the picture, so it stays legible at 20px.
export function LioAvatar({state='idle',size=40,className=''}:{state?:LioState;size?:number;className?:string}){
  return <span className={`lio ${className}`} data-state={state} style={{width:size,height:size}} aria-hidden="true">
    <img src="/dashboard/lio/lio-head.webp" alt="" width={size} height={size} draggable={false}/>
  </span>;
}

// The waving robot from the welcome screen; people who reduce motion get a still frame.
export function LioGreeting({width=160}:{width?:number}){
  return <picture className="lio-greeting" aria-hidden="true">
    <source media="(prefers-reduced-motion: reduce)" srcSet="/dashboard/lio/lio-hello-still.webp"/>
    <img src="/dashboard/lio/lio-hello.webp" alt="" width={width} height={Math.round(width*207/240)} draggable={false}/>
  </picture>;
}
