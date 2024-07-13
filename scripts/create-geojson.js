const fs = require("fs");
const path = require("path");

const filePath = "/Users/leith/Downloads/uk-postcode-polygons-master/geojson";

// Make an async function that gets executed immediately
(async () => {
  // Our starting point
  try {
    // Get the files as an array
    const files = await fs.promises.readdir(filePath);
    const result = { type: "FeatureCollection", features: [] };
    // Loop them all with the new for...of
    for (const file of files) {
      // Get the full paths
      const fromPath = path.join(filePath, file);

      // Stat the file to see if we have a file or dir
      const stat = await fs.promises.stat(fromPath);

      if (stat.isFile()) {
        const data = await fs.promises.readFile(fromPath, "utf8");
        const json = JSON.parse(data);
        result.features.push(...json.features);
        console.log("'%s' is a file.", fromPath);
      } else if (stat.isDirectory())
        console.log("'%s' is a directory.", fromPath);
    } // End for...of

    fs.writeFile("geo.geojson", JSON.stringify(result), (err) => {
      if (err) throw err;
    });
  } catch (e) {
    // Catch anything bad that happens
    console.error("We've thrown! Whoops!", e);
  }
})(); // Wrap in parenthesis and call now
