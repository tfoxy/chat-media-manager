import { Contact, MessageMedia } from "./sql";
import { basename, extname, extractNumberFromJid, isWaGroup } from "./utils";

export interface RowMessageMedia extends MessageMedia {
  filename: string;
  sender: string;
  chat: string;
  isGroup: boolean;
  realFileSize: number | undefined;
}

function getSender(
  media: MessageMedia,
  contactMap: Map<string, Contact>,
  me: string
) {
  if (media.key_from_me) {
    return me;
  }
  const contactJid = media.remote_resource || media.key_remote_jid;
  const contact = contactMap.get(contactJid);
  return (
    contact?.wa_name ??
    contact?.given_name ??
    contact?.number ??
    extractNumberFromJid(contactJid)
  );
}

function getChat(media: MessageMedia, contactMap: Map<string, Contact>) {
  const contactJid = media.key_remote_jid;
  const contact = contactMap.get(contactJid);
  return contact?.display_name ?? extractNumberFromJid(contactJid);
}

function getMimeFromName(filename: string) {
  const ext = extname(filename);
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
  }
  return undefined;
}

export function transformMedia(
  media: MessageMedia,
  contactMap: Map<string, Contact>,
  fileSizeMap: Map<string, number>
): RowMessageMedia {
  const me = "Me";
  return {
    ...media,
    mime_type: media.mime_type ?? getMimeFromName(media.file_path),
    filename: basename(media.file_path),
    chat: getChat(media, contactMap),
    sender: getSender(media, contactMap, me),
    isGroup: isWaGroup(media.key_remote_jid),
    realFileSize: fileSizeMap.get(media.file_path),
  };
}
