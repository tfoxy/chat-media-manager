# Chat Media Manager

Work in progress...

## Settings

- `Me`: The contact name that will appear when a file was sent by you.

## Folder structure

When selecting WhatsApp folder, it expects a folder with the following structure:

- `Media`: Where all the media files are stored. In the phone it's generally located in `/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/` or `/storage/emulated/0/WhatsApp/`.
- `msgstore.db`: Message database from WhatsApp. See [Extraction tools](#extraction-tools) for more information.
- `wa.db`: Contact database from WhatsApp. See [Extraction tools](#extraction-tools) for more information.

## Output

When pressing "Write to disk", it will create an `output` folder inside the selected WhatsApp folder. The structure is:

- `output/`
  - `{group name} - {group creation date}/` _or_
  - `{contact name} - {contact phone number}/`
    - `{media date} - {media sender} - {media message} - {media name}.mp4`

## Extraction tools

The message database found in `WhatsApp/Databases/msgstore.db.crypt14` is encrypted, so a key is needed to access the data. The key is inside the WhatsApp installation folder and cannot be normally accessed. The contact database is also inside this folder.

To access the WhatsApp installation folder, there are two ways. One is to have root access. The other one is to create a backup with the computer. Any of the following tools help with that:

- https://github.com/YuvrajRaghuvanshiS/WhatsApp-Key-Database-Extractor
- https://github.com/KnugiHK/WhatsApp-Key-DB-Extractor
