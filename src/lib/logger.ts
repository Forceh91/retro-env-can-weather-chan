import { format } from "date-fns";

const DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";

export default class Logger {
  constructor(private readonly name: string) {}

  private formattedDate(): string {
    return format(Date.now(), DATE_FORMAT);
  }

  log(message: string, ...optionalParams: any[]) {
    console.log(`[${this.formattedDate()}]`, `[${this.name.toUpperCase()}]`, message, ...optionalParams);
  }

  error(message: string, ...optionalParams: any[]) {
    console.error(`[${this.formattedDate()}]`, `[${this.name.toUpperCase()}]`, message, ...optionalParams);
  }

  warn(message: string, ...optionalParams: any[]) {
    console.warn(`[${this.formattedDate()}]`, `[${this.name.toUpperCase()}]`, message, ...optionalParams);
  }
}
