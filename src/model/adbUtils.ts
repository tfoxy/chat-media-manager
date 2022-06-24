import electronAPI from "./electronAPI";
import { Contact } from "./sql";

export async function fetchAdbContactsByJid(): Promise<Map<string, Contact>> {
  const output = await electronAPI!.fetchAdbContacts();
  const regex = /^Row: \d+ display_name=(.+), data1=(\d+@s\.whatsapp\.net)$/gm;
  const map = new Map<string, Contact>();
  for (const [, displayName, jid] of output.matchAll(regex)) {
    map.set(jid, {
      jid,
      display_name: displayName,
      wa_name: displayName,
      given_name: null,
      number: null,
    });
  }
  return map;
}
