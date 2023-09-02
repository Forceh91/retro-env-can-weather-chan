export type TempRecordDays = { records: TempRecordDay[] };

export type TempRecordDay = {
  hi: TempRecord;
  lo: TempRecord;
};

export type TempRecord = {
  value: number;
  year: number;
};
