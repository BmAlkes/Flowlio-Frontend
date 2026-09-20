import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { OperationsContent, type OperationalSummary } from "./operations.page";
import en from "@/locales/operations/en.json";
vi.mock("react-i18next",()=>({useTranslation:()=>({t:(key:string)=>(en as Record<string,string>)[key.replace("operations.","")]||key,i18n:{language:"en"}})}));
vi.mock("@/configs/axios.config",()=>({axios:{get:vi.fn()}}));
vi.mock("@/providers/user.provider",()=>({useUser:()=>({data:null,isSuperAdmin:false})}));
afterEach(cleanup);
const data:OperationalSummary={metrics:[],alerts:[],events:[{id:"a",source:"api",code:"HTTP_SERVER_ERROR",route:"/all",correlationId:"api-reference",release:"abc123",occurredAt:"2026-09-20T10:00:00Z",status:500},{id:"b",source:"job",code:"JOB_RETRY",route:"invoice-reminder",correlationId:"job-reference",release:"abc123",occurredAt:"2026-09-20T10:00:00Z",status:null}]};
it("filters failures without hiding the available source selection",()=>{
 render(<OperationsContent data={data} refresh={()=>{}}/>);
 fireEvent.change(screen.getByRole("combobox",{name:"Source"}),{target:{value:"job"}});
 expect(screen.getByText("job-reference")).toBeInTheDocument();expect(screen.queryByText("api-reference")).not.toBeInTheDocument();
});
it("distinguishes absent measurements from a claim that everything is healthy",()=>{
 render(<OperationsContent data={{metrics:[],events:[],alerts:[]}} refresh={()=>{}}/>);
 expect(screen.getByText("No failures recorded in this window.")).toBeInTheDocument();expect(screen.getAllByText("No measurements yet")).toHaveLength(2);
});
it("provides an actionable warning and a refresh button",()=>{
 const refresh=vi.fn();render(<OperationsContent data={{...data,alerts:[{source:"api",code:"REPEATED_FAILURES"}]}} refresh={refresh}/>);
 expect(screen.getByText("Recent operations need attention")).toBeInTheDocument();fireEvent.click(screen.getByRole("button",{name:"Refresh"}));expect(refresh).toHaveBeenCalledOnce();
});
