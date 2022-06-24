import { Tabulator } from "tabulator-tables";
import { isHTMLElementOfType } from "~/model/assertions";
import { RowMessageMedia } from "~/model/mediaTransformer";
import { mediaWaType, MediaWaType } from "~/model/sql";
import { formatDate } from "~/model/utils";

function getMediaElement(waType: MediaWaType, mimeType: string) {
  switch (waType) {
    case mediaWaType.IMAGE:
    case mediaWaType.STICKER:
      return "img";
    case mediaWaType.AUDIO:
      return "audio";
    case mediaWaType.VIDEO:
    case mediaWaType.ANIMATED_GIF:
      return "video";
  }
  if (mimeType.startsWith("image/")) {
    return "img";
  }
  if (mimeType.startsWith("audio/")) {
    return "audio";
  }
  if (mimeType.startsWith("video/")) {
    return "video";
  }
  return undefined;
}

const epochFormatter: Tabulator.Formatter = (cell) =>
  formatDate(new Date(cell.getValue()));

const previewFormatter: Tabulator.Formatter = (cell) => {
  const { media_wa_type: waType, mime_type: mimeType } =
    cell.getData() as RowMessageMedia;
  const tag = getMediaElement(waType, mimeType);
  const url = `remote://${cell.getValue()}`;
  if (!tag) {
    const el = document.createElement("a");
    el.href = url;
    el.textContent = "Download";
    el.download = "";
    return el;
  }
  const el = document.createElement(tag);
  if (isHTMLElementOfType(el, "VIDEO")) {
    el.autoplay = true;
    el.loop = true;
    el.muted = true;
  } else if (isHTMLElementOfType(el, "AUDIO")) {
    el.controls = true;
  }
  el.src = url;
  el.style.maxHeight = "50px";
  el.style.maxWidth = "200px";
  el.addEventListener("load", () => {
    cell.getRow().normalizeHeight();
  });
  return el;
};

function convertToByteSize(value: number) {
  const units = ["B", "KB", "MB", "GB"];
  let level = 1;
  while (value >= 1024 && level < units.length) {
    value /= 1024;
    level += 1;
  }
  return `${value.toPrecision(4)} ${units[level - 1]}`;
}

const byteSizeFormatter: Tabulator.Formatter = (cell) =>
  convertToByteSize(cell.getValue());

const sizeColumnCalculator: Tabulator.ColumnCalc = (
  values,
  data: RowMessageMedia[]
) => {
  const fileSet = new Set<string>();
  const sum = data.reduce((sum, media) => {
    if (fileSet.has(media.file_path)) return sum;
    fileSet.add(media.file_path);
    return sum + (media.realFileSize ?? 0);
  }, 0);
  return convertToByteSize(sum);
};

export function getMediaTableColumns(): Array<
  Tabulator.ColumnDefinition & {
    field: keyof RowMessageMedia;
  }
> {
  return [
    {
      title: "Name",
      field: "filename",
      frozen: true,
      tooltip: ((_: Event, cell: Tabulator.CellComponent) => {
        const media = cell.getData() as RowMessageMedia;
        return media.file_path;
      }) as () => string,
    },
    {
      title: "Date",
      field: "timestamp",
      formatter: epochFormatter,
    },
    {
      title: "Preview",
      field: "file_path",
      formatter: previewFormatter,
      headerSort: true,
    },
    {
      title: "Chat",
      field: "chat",
      headerFilter: true,
      headerMenu: [
        {
          label: (column) =>
            column.getTable().getGroups()[0]?.getField() === column.getField()
              ? "Ungroup"
              : "Group",
          action: (e, column) =>
            column.getTable().setGroupBy(column.getField()),
        },
      ],
    },
    { title: "Sender", field: "sender", headerFilter: true },
    { title: "MIME", field: "mime_type", headerFilter: true },
    {
      title: "Size",
      field: "realFileSize",
      formatter: byteSizeFormatter,
      topCalc: sizeColumnCalculator,
      headerSortStartingDir: "desc",
    },
    { title: "Caption", field: "media_caption" },
  ];
}
