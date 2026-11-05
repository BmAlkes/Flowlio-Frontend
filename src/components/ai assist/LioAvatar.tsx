import './lio-avatar.css';

export type LioState='idle'|'thinking'|'happy'|'error';

// Lio, the assistant's face. The state only changes eyes, mouth and spark, so it stays legible at 20px.
export function LioAvatar({state='idle',size=40,className=''}:{state?:LioState;size?:number;className?:string}){
  return <svg className={`lio ${className}`} data-state={state} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
    <g className="lio-head">
      <circle cx="24" cy="26" r="20" className="lio-face"/>
      <g className="lio-eyes">
        <rect x="15" y="18" width="5" height="9" rx="2.5" className="lio-eye"/>
        <rect x="28" y="18" width="5" height="9" rx="2.5" className="lio-eye"/>
      </g>
      <path d="M17 32.5q7 5.5 14 0" className="lio-mouth lio-smile"/>
      <path d="M18.5 34h11" className="lio-mouth lio-flat"/>
      <ellipse cx="24" cy="34" rx="2.6" ry="2.2" className="lio-o"/>
    </g>
    <path d="M38 2.5l1.6 4.4 4.4 1.6-4.4 1.6L38 14.5l-1.6-4.4-4.4-1.6 4.4-1.6z" className="lio-spark"/>
  </svg>;
}
