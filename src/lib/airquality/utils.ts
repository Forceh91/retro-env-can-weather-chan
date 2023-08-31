import { AIR_QUALITY_BAD, AIR_QUALITY_FAIR, AIR_QUALITY_POOR } from "consts";

export function getAQHITextSummary(aqhi: number) {
  if (aqhi > AIR_QUALITY_BAD) return "Bad";
  if (aqhi >= AIR_QUALITY_POOR) return "Poor";
  if (aqhi >= AIR_QUALITY_FAIR) return "Fair";
  else return "Good";
}

export function getAQHIRisk(aqhi: number) {
  if (aqhi > AIR_QUALITY_BAD) return "V High";
  if (aqhi >= AIR_QUALITY_POOR) return "High";
  if (aqhi >= AIR_QUALITY_FAIR) return "Moderate";
  else return "";
}

export function getAQHIWarningMessage(aqhi: number) {
  if (aqhi > AIR_QUALITY_BAD)
    return "REDUCE/RESCHEDULE STRENUOUS\nACTIVITIES OUTDOORS IF YOU\nEXPERIENCE SYMPTOMS SUCH AS\nCOUGHING & THROAT IRRITATION.\nAVOID IF YOU HAVE HEART/LUNG\nCONDITIONS & ELDERLY/CHILDREN";
  if (aqhi >= AIR_QUALITY_POOR)
    return "CONSIDER REDUCING/RESCHEDULING\nSTRENUOUS ACTIVITIES OUTDOORS IF\nYOU EXPERIENCE SYMPTOMS SUCH AS\nCOUGHING & THROAT IRRITATION.\nTHOSE WITH HEART/LUNG CONDITIONS\n& ELDERLY/CHILDREN=GREATER RISK.";
  if (aqhi >= AIR_QUALITY_FAIR)
    return "CONSIDER MODIFYING YOUR USUAL\nOUTDOOR ACTIVITIES IF YOU\nEXPERIENCE SYMPTOMS SUCH AS\nCOUGHING AND THROAT IRRITATION.\nTHOSE WITH HEART OR LUNG\nCONDITIONS ARE AT GREATER RISK.";
  else return "";
}

export function doesAQHINeedWarning(aqhi: number) {
  return aqhi >= AIR_QUALITY_FAIR;
}
