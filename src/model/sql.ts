import initSqlJs, { Database, SqlJsStatic } from "sql.js";
import wasmURL from "sql.js/dist/sql-wasm.wasm?url";

let sqlPromise: Promise<SqlJsStatic>;

export function createDatabase(
  data?: ArrayLike<number> | Buffer | null
): Promise<Database> {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({
      locateFile: () => wasmURL,
    });
  }
  return sqlPromise.then((sql) => new sql.Database(data));
}

export const mediaWaType = {
  MESSAGE: "0",
  IMAGE: "1",
  AUDIO: "2",
  VIDEO: "3",
  CONTACT: "4",
  LOCATION: "5",
  CALL: "8",
  DOCUMENT: "9",
  CALL_LOST: "10",
  WAITING: "11",
  ANIMATED_GIF: "13",
  VCARD_MULTIPLE: "14",
  DELETED: "15",
  SHARE_LOCATION: "16",
  STICKER: "20",
  PHOTO_ONCE: "42",
};

export interface Contact {
  jid: string;
  display_name: string;
  wa_name: string | null;
  number: string | null;
  given_name: string | null;
}

export interface MessageMedia {
  file_path: string;
  key_from_me: string;
  timestamp: string;
  media_caption: string;
  remote_resource: string;
  media_wa_type: string;
  key_remote_jid: string;
  sender: string;
}
