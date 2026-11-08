import {render,screen,fireEvent} from '@testing-library/react';
import {describe,it,expect,vi,beforeEach,afterEach} from 'vitest';

const state=vi.hoisted(()=>({ranges:[] as {startDate:string;endDate:string}[],events:[] as Record<string,unknown>[]}));
vi.mock('@/hooks/usefetchcalendarevents',()=>({useFetchCalendarEvents:(range:{startDate:string;endDate:string})=>{state.ranges.push(range);
 const from=new Date(range.startDate).getTime(),to=new Date(range.endDate).getTime();
 return{data:{data:state.events.filter(e=>{const at=new Date(e.date as string).getTime();return at>=from&&at<=to;})}};}}));
vi.mock('@/hooks/usecreatecalendarevent',()=>({useCreateCalendarEvent:()=>({mutate:vi.fn()})}));
vi.mock('@/hooks/useupdatecalendarevent',()=>({useUpdateCalendarEvent:()=>({mutate:vi.fn()})}));
vi.mock('@/hooks/usedeletecalendarevent',()=>({useDeleteCalendarEvent:()=>({mutate:vi.fn()})}));
vi.mock('@/hooks/useTimezone',()=>({useTimezone:()=>{}}));
vi.mock('/dashboard/google-meet.svg',()=>({default:'meet.svg'}));
vi.mock('/dashboard/whatsapp-icon.svg',()=>({default:'whatsapp.svg'}));
vi.mock('/dashboard/google-drive.svg',()=>({default:'drive.svg'}));
vi.mock('./CalendarSidebar',()=>({CalendarSidebar:()=>null}));
vi.mock('./WeekView',()=>({WeekView:()=>null}));
vi.mock('./DayView',()=>({DayView:()=>null}));
vi.mock('./calendareventmodal',()=>({EventModal:()=>null}));
vi.mock('./eventdetailspopup',()=>({EventDetailsPopup:()=>null}));
vi.mock('react-i18next',()=>({useTranslation:()=>({i18n:{language:'en'},t:(key:string)=>key.split('.').pop()})}));
import {CustomCalendarHeader} from './customecalenderheader';

const event=(id:string,title:string,date:Date)=>({id,title,date:date.toISOString(),startHour:9,endHour:10,calendarType:'meeting',platform:'none'});
const nextButton=(title:string)=>screen.getByText(title).nextElementSibling as HTMLElement;

describe('calendar month view',()=>{
 beforeEach(()=>{
  vi.useFakeTimers({toFake:['Date']});vi.setSystemTime(new Date(2026,10,7,12));state.ranges=[];
  state.events=[event('a','First week',new Date(2026,10,2)),event('b','Second Sunday',new Date(2026,10,8)),event('c','End of month',new Date(2026,10,30)),event('d','December',new Date(2026,11,3))];
 });
 afterEach(()=>vi.useRealTimers());

 it('loads and shows every event of the month, not only the current week',()=>{
  render(<CustomCalendarHeader/>);
  fireEvent.click(screen.getByRole('button',{name:'month'}));
  const range=state.ranges.at(-1)!;
  expect(new Date(range.startDate)).toEqual(new Date(2026,10,1));
  expect(new Date(range.endDate)).toEqual(new Date(2026,10,30,23,59,59,999));
  for(const title of ['First week','Second Sunday','End of month'])expect(screen.getByText(title)).toBeTruthy();
  expect(screen.queryByText('December')).toBeNull();
 });

 it('moves a whole month at a time and opens on the right month when the week starts in the previous one',()=>{
  vi.setSystemTime(new Date(2026,11,2,12));
  render(<CustomCalendarHeader/>);
  fireEvent.click(screen.getByRole('button',{name:'month'}));
  expect(screen.getByText('December 2026')).toBeTruthy();
  expect(screen.getByText('December')).toBeTruthy();
  fireEvent.click(nextButton('December 2026'));
  expect(screen.getByText('January 2027')).toBeTruthy();
  expect(new Date(state.ranges.at(-1)!.startDate)).toEqual(new Date(2027,0,1));
 });
});
