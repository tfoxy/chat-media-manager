import { readFile, writeFile } from "./fs";
import { logger } from "./logger";
import { Contact, mediaWaType, MessageMedia } from "./sql";
import { basename, escapeInvalidFilenameCharacters, formatDate } from "./utils";

function getGroupCreatedDate(jid: string) {
  const timestampMatch = jid.match(/-(\d+)@/);
  return timestampMatch && new Date(+timestampMatch[1] * 1000);
}

function getContactTitle(contact: Contact) {
  if (!contact.display_name) {
    return contact.jid;
  }
  const groupCreatedDate = getGroupCreatedDate(contact.jid);
  const title = `${contact.display_name} - ${
    groupCreatedDate ? formatDate(groupCreatedDate) : contact.number
  }`;
  return escapeInvalidFilenameCharacters(title);
}

function getMediaTitle(media: MessageMedia): string {
  const filename = basename(media.file_path);
  const date = new Date(media.timestamp);
  const description = media.media_caption || "";
  const title = [
    formatDate(date),
    media.sender,
    `${description.slice(0, 40)}${description.length > 40 ? "…" : ""}`,
    media.media_wa_type === mediaWaType.ANIMATED_GIF ? "GIF" : "",
    filename,
  ]
    .filter(Boolean)
    .join(" - ");
  return escapeInvalidFilenameCharacters(title);
}

export class Writer {
  constructor(
    readonly handle: FileSystemDirectoryHandle,
    readonly contactMap: Map<string, Contact>,
    readonly mediaListMap: Map<string, MessageMedia[]>
  ) {}

  async createMediaFolderByContact(): Promise<void> {
    for (const [jid, mediaList] of this.mediaListMap.entries()) {
      let contact = this.contactMap.get(jid);
      if (!contact) {
        logger.dispatchEvent(
          "warn",
          new Error(`Contact info of "${jid}" not found`)
        );
        contact = {
          display_name: "",
          given_name: null,
          jid,
          number: null,
          wa_name: null,
        };
      }
      await this.createContactMediaFolder(contact, mediaList);
    }
  }

  private async createContactMediaFolder(
    contact: Contact,
    mediaList: MessageMedia[]
  ): Promise<void> {
    const dirName = getContactTitle(contact);
    const outputHandle = await this.handle.getDirectoryHandle("output", {
      create: true,
    });
    logger.dispatchEvent("info", `Creating dir "${dirName}"`);
    const dirHandle = await outputHandle.getDirectoryHandle(dirName, {
      create: true,
    });
    for (const media of mediaList) {
      const title = getMediaTitle(media);
      const filePath = media.file_path;
      let file: File;
      try {
        logger.dispatchEvent(
          "info",
          `Reading file "${filePath}" sent by "${media.sender}"`
        );
        file = await readFile(this.handle, filePath);
      } catch (err) {
        if (
          err instanceof DOMException &&
          err.code === DOMException.NOT_FOUND_ERR
        ) {
          Object.defineProperty(err, "message", {
            value: `${err.message} File: ${filePath}`,
          });
          logger.dispatchEvent("warn", err);
          continue;
        }
        if (
          err instanceof TypeError &&
          err.message === "Name is not allowed."
        ) {
          Object.defineProperty(err, "message", {
            value: `Cannot read file ${filePath}`,
          });
          logger.dispatchEvent("warn", err);
          continue;
        }
        console.dir(err);
        throw err;
      }
      logger.dispatchEvent("info", `Writing file "${dirName}/${title}"`);
      await writeFile(dirHandle, title, file);
    }
  }
}
