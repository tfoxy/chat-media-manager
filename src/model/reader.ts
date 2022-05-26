import { readFile } from "./fs";
import { logger } from "./logger";
import { getContactMap, getMediaByGroup, readDatabase } from "./query";
import { Writer } from "./writer";

export class Reader {
  private async readWaFile(handle: FileSystemDirectoryHandle) {
    const file = await readFile(handle, "wa.db");
    return readDatabase(file);
  }

  private async readMsgtoreFile(handle: FileSystemDirectoryHandle) {
    const file = await readFile(handle, "msgstore.db");
    return readDatabase(file);
  }

  async readAndQueryDatabase(
    handle: FileSystemDirectoryHandle,
    me: string
  ): Promise<Writer> {
    logger.dispatchEvent("info", "Reading wa.db file");
    const wa = await this.readWaFile(handle);
    logger.dispatchEvent("info", "Querying contacts");
    const contactMap = await getContactMap(wa);
    logger.dispatchEvent("info", `Total contacts: ${contactMap.size}`);
    wa.close();

    logger.dispatchEvent("info", "Reading msgtore.db file");
    const msgstore = await this.readMsgtoreFile(handle);
    logger.dispatchEvent("info", "Querying media");
    const mediaListMap = await getMediaByGroup(msgstore, contactMap, me);
    msgstore.close();

    return new Writer(handle, contactMap, mediaListMap);
  }
}
