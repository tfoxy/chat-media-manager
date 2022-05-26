import { TypedEventTarget } from "./eventTarget";

export const logger = new TypedEventTarget<{
  info: string;
  warn: Error;
  error: Error;
}>();
