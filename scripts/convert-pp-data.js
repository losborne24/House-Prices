const fs = require("fs");
const path = require("path");
const papa = require("papaparse");

const getLatest = (filePath, data) => {
  try {
    return new Promise((resolve, reject) => {
      papa.parse(fs.createReadStream(filePath + "/latest/2024-05-latest.csv"), {
        header: false,
        worker: false,
        step: function (results, parser) {
          const postcode = results.data[3].slice(
            0,
            results.data[3].indexOf(" ")
          );
          const propertyType = results.data[4];
          const year = results.data[2].slice(0, results.data[2].indexOf("-"));
          const isAdd = results.data[15] === "A";
          const thisYear = "2024";
          // filter out property type: "other"
          if (propertyType !== "O" && year === thisYear && isAdd) {
            data[postcode] = [
              ...(data[postcode] || []),
              {
                price: Number(results.data[1]),
                year,
                propertyType,
                isNewBuild: results.data[5] === "Y",
                isFreehold: results.data[6] === "F",
              },
            ];
          }
        },
        complete: function (results, file) {
          resolve(data);
        },
        error(err, file) {
          reject(err);
        },
      });
    });
  } catch (err) {
    console.log(err);
  }
};

const getData = (filePath, data) => {
  try {
    return new Promise((resolve, reject) => {
      papa.parse(fs.createReadStream(filePath), {
        header: false,
        worker: false,
        step: function (results, parser) {
          const postcode = results.data[3].slice(
            0,
            results.data[3].indexOf(" ")
          );
          const year = results.data[2].slice(0, results.data[2].indexOf("-"));
          const propertyType = results.data[4];
          // filter out property type: "other"
          if (propertyType !== "O") {
            data[postcode] = [
              ...(data[postcode] || []),
              {
                price: Number(results.data[1]),
                year,
                propertyType,
                isNewBuild: results.data[5] === "Y",
                isFreehold: results.data[6] === "F",
              },
            ];
          }
        },
        complete: function (results, file) {
          resolve(data);
        },
        error(err, file) {
          reject(err);
        },
      });
    });
  } catch (err) {
    console.log(err);
  }
};

// Make an async function that gets executed immediately
(async () => {
  const filePath = "/Users/leith/Documents/temp/mapbox/data/datasets";
  // Our starting point
  try {
    const data = {};
    await getLatest(filePath, data);
    // console.log(data);
    // Get the files as an array
    const files = await fs.promises.readdir(filePath);
    // Loop them all with the new for...of
    for (const file of files) {
      // Get the full paths
      const fromPath = path.join(filePath, file);

      // Stat the file to see if we have a file or dir
      const stat = await fs.promises.stat(fromPath);

      if (stat.isFile()) {
        await getData(fromPath, data);
        console.log("'%s' is a file.", fromPath);
      } else if (stat.isDirectory())
        console.log("'%s' is a directory.", fromPath);
    } // End for...of
    console.log(data);
    fs.writeFile("dataset.json", JSON.stringify(data), (err) => {
      if (err) throw err;
    });
  } catch (e) {
    // Catch anything bad that happens
    console.error("We've thrown! Whoops!", e);
  }
})(); // Wrap in parenthesis and call now
