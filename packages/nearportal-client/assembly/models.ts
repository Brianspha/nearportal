import {
    PersistentVector,
    PersistentMap,
  } from "near-sdk-as";
  
  // /**
  //  * collections.vector is a persistent collection. Any changes to it will
  //  * be automatically saved in the storage.
  //  * The parameter to the constructor needs to be unique across a single contract.
  //  * It will be used as a prefix to all keys required to store data in the storage.
  //  */
  
  // export const reports = new PersistentVector<Report>("m");
  
  /**
   */
  
  @nearBindgen
  export class Report {
    constructor(
      public skyLink: string,
      public title: string,
      public description: string,
      public resolved: boolean,
      public location: string,
      public active: boolean
    ) {}
  }
  @nearBindgen
  export class ResolvedReport {
    constructor(
      public skyLink: string,
      public resolvedSkylink: string,
      public active: bool
    ) {}
  }
  export const reports = new PersistentVector<Report>("e");
  export const reportsKeys = new PersistentVector<string>("e");
  export const reportsMap = new PersistentMap<string, Report>("a");
  export const resolvedReports = new PersistentVector<ResolvedReport>("e");
  export const resolvedReportsKeys = new PersistentVector<string>("e");
  export const resolvedreportsMap = new PersistentMap<string, ResolvedReport>("a");
  
  