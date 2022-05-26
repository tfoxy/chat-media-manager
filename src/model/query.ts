import { BindParams, Database } from "sql.js";
import { Contact, createDatabase, mediaWaType, MessageMedia } from "./sql";
import { extractNumberFromJid } from "./utils";

function* query<T extends { [K in keyof T]: T[K] }>(
  db: Database,
  sql: string,
  params?: BindParams
): Generator<T, void> {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  while (stmt.step()) {
    yield stmt.getAsObject() as T;
  }
  if (!stmt.free()) {
    console.error("Couldn't free statement", stmt);
  }
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

export const readDatabase = async (file: File): Promise<Database> =>
  createDatabase(new Uint8Array(await file.arrayBuffer()));

export const queryAll = async (db: Database, stmt: string) => {
  const rows = [];
  for (const row of query(db, stmt)) {
    rows.push(row);
  }
  return rows;
};

/**
 * @param db from "wa.db" file
 */
export function getContactMap(db: Database): Map<string, Contact> {
  const map = new Map<string, Contact>();
  for (const contact of query<Contact>(
    db,
    `SELECT jid, display_name, wa_name, number, given_name FROM wa_contacts`
  )) {
    map.set(contact.jid, contact);
  }
  return map;
}

/**
 * @param db from "msgstore.db" file
 */
export function getMediaByGroup(
  db: Database,
  contactMap: Map<string, Contact>,
  me: string
): Map<string, MessageMedia[]> {
  const mediaTypes = [
    mediaWaType.VIDEO,
    // mediaWaType.ANIMATED_GIF,
  ];
  const mediaListMap = new Map<string, MessageMedia[]>();
  for (const media of query<MessageMedia>(
    db,
    `
    SELECT
      message_media.file_path,
      messages.key_from_me,
      messages.timestamp,
      messages.media_caption,
      messages.remote_resource,
      messages.media_wa_type,
      messages.key_remote_jid
    FROM message_media
    INNER JOIN messages
      ON message_media.message_row_id = messages._id
    WHERE message_media.file_path IS NOT NULL
      AND messages.media_wa_type IN (${mediaTypes.map(() => "?")})
      AND message_media.gif_attribution = 0
    ORDER BY messages.timestamp
  `,
    mediaTypes
  )) {
    media.sender = getSender(media, contactMap, me);
    let mediaList = mediaListMap.get(media.key_remote_jid);
    if (!mediaList) {
      mediaList = [];
      mediaListMap.set(media.key_remote_jid, mediaList);
    }
    mediaList.push(media);
  }

  return mediaListMap;
}
