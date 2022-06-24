import { TabulatorFull } from "tabulator-tables";

TabulatorFull.extendModule("keybindings", "actions", {
  deleteSelectedRows: function (this: { table: TabulatorFull }) {
    const rows = this.table.getSelectedRows();
    for (const row of rows) {
      row.delete();
    }
  },
});

TabulatorFull.extendModule("keybindings", "bindings", {
  deleteSelectedRows: "46", // supr key
});
