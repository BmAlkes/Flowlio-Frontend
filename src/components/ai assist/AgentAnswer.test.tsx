import { cleanup,render,screen } from '@testing-library/react';
import { afterEach,expect,it } from 'vitest';
import { MemoryRouter } from 'react-router';
import { AgentAnswer } from './AgentAnswer';

const sources=[{key:'project:p1',kind:'project',id:'p1',title:'Website',href:'/dashboard/project/view/p1'}];
const show=(text:string)=>render(<MemoryRouter><AgentAnswer text={text} sources={sources}/></MemoryRouter>);
afterEach(cleanup);

it('renders bold text without leaving Markdown markers',()=>{show('Status: **Atrasado**');expect(screen.getByText('Atrasado').tagName).toBe('STRONG');expect(document.body.textContent).not.toContain('**');});
it('turns source keys in double brackets into authorized links',()=>{show('Veja [[project:p1]] agora');expect(screen.getByRole('link',{name:'Website'})).toHaveAttribute('href','/dashboard/project/view/p1');expect(document.body.textContent).not.toContain('[[');});
it('links model-written Markdown only when the path is an authorized source, even with escaped slashes',()=>{show('[Ver projeto](\\/dashboard\\/project\\/view\\/p1)');expect(screen.getByRole('link',{name:'Ver projeto'})).toHaveAttribute('href','/dashboard/project/view/p1');});
it('never links invented or unsafe URLs and keeps only their label',()=>{show('[Open](/dashboard/project/view/other) and [Run](javascript:alert(1)) and [[project:missing]]');expect(screen.queryByRole('link')).not.toBeInTheDocument();expect(document.body.textContent).toContain('Open');expect(document.body.textContent).toContain('Run');expect(document.body.textContent).not.toContain('javascript');expect(document.body.textContent).not.toContain('missing');});
it('keeps plain text and list lines untouched',()=>{show('1. First\n2. Second');expect(document.body.textContent).toBe('1. First\n2. Second');});
