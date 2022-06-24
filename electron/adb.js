const { spawn } = require("child_process");
const { getMainWindow } = require("./mainWindow");

/**
 * @param {string[]} args
 * @returns {Promise<string>}
 */
module.exports = function adb(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("adb", args);
    let output = "";
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (data) => {
      const part = String(data);
      output += part;
      getMainWindow().webContents.send("event", "adbOutput", part);
    });
    child.stderr.on("data", (data) => {
      const part = String(data);
      output += part;
      getMainWindow().webContents.send("event", "adbOutput", part);
    });
    child.on("close", (code) => {
      if (code) {
        reject(
          new Error(
            `adb exit code ${code}${output.length > 0 ? `\n${output}` : ""}`
          )
        );
      } else {
        resolve(output);
      }
    });
  });
};
