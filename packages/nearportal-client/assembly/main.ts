

import { Context, logging, storage } from "near-sdk-as";
import { resolvedReportsKeys,reportsKeys, Report, reports,reportsMap, ResolvedReport, resolvedReports, resolvedreportsMap} from "./models";

const RETURN_LIMIT=200;
export function logReport(skyLink: string,
   title: string,
   description: string,
  location: string):string
  {
    var reported =reportReported(skyLink)
    var message ="";
    if(!reported){
      var tempReport= new Report(skyLink,title,description,false,location,true);
      reports.push(tempReport);
      reportsMap.set(skyLink,tempReport);
      reportsKeys.push(skyLink);
      logging.log("Logged new  report");
      message="Logged new  report";
    } 
    else{
      message ="Aready Reported";
    }
    return message;
  }

  export function getReportsKeys(): Array<string>{
    const numMessages = min(RETURN_LIMIT, reportsKeys.length);
    const startIndex = reportsKeys.length - numMessages;
    var results = new Array<string>(numMessages);
    for(var i =0; i< results.length;i++){
      results[i] = reportsKeys[i + startIndex];
    }
    return results;
  }
  //@dev this is bad design...
  export function getResolvedReportKeys(): Array<string>{
    if(resolvedReportsKeys.length===0){
      return [];
    }
    const numMessages = min(RETURN_LIMIT, resolvedReportsKeys.length);
    const startIndex = resolvedReportsKeys.length - numMessages;
    var results = new Array<string>(numMessages);
    for(var i =0; i< results.length;i++){
      results[i] = resolvedReportsKeys[i + startIndex];
    }
    return results;
  }

export function getReport(skyLink:string) :Report{
  return reportsMap.getSome(skyLink);
}
export function getResolvedReport(skyLink:string) :ResolvedReport{
  return resolvedreportsMap.getSome(skyLink);
}
export function updateReportStatus(skyLink: string,resolvedSkyLink: string): string{
  var resolved = alreadyResolved(skyLink);
  var message = "";
  if(!resolved){
    var tempReport = new ResolvedReport(skyLink,resolvedSkyLink,true);
    resolvedReports.push(tempReport);
    resolvedreportsMap.set(resolvedSkyLink,tempReport);
    resolvedReportsKeys.push(skyLink);
    resolveReport(skyLink);
    message="Successfully resolved report";
  }
  else{
    message="Already Resolved";
  }
  return message;
}
export function resolveReport(skyLink:string):bool{
 for(var i=0; i < reports.length;i++){
   if(reports[i].skyLink === skyLink){
    reports[i].resolved=true; 
    reports.replace(i,reports[i]);
    reportsMap.set(skyLink,reports[i]);
   }
 }
 return true;
}
export function alreadyResolved(skyLink: string): bool{
 return reportsMap.getSome(skyLink).resolved;
}
export function reportReported(reportSkyLink: string) :bool{
  return reportsMap.contains(reportSkyLink);
}
