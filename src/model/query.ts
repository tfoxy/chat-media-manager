import { BindParams, Database } from "sql.js";
import { Contact, MessageMedia } from "./sql";

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

export const queryAll = <T>(db: Database, stmt: string): T[] => {
  const rows: T[] = [];
  for (const row of query<T>(db, stmt)) {
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
export function getMediaList(db: Database): MessageMedia[] {
  return queryAll<MessageMedia>(
    db,
    `
    SELECT
      message_media.file_path,
      message_media.file_size,
      message_media.file_length,
      message_media.mime_type,
      message_media.width,
      message_media.height,
      message_media.media_duration,
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
    ORDER BY messages.timestamp
  `
  );
}
