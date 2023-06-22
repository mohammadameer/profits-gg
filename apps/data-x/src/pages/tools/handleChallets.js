const chalets = require("./chalets");

console.log(`Total chalets: ${chalets.length}`);

let duplicated = 0;

const filteredChalets =  []

chalets.forEach((chalet) => {
    const duplicate = filteredChalets.find((item) => item.place_id === chalet.place_id);
    if (duplicate) {
        duplicated++;
        return;
    }
    filteredChalets.push(chalet);
    }
);

console.log(`Removed ${duplicated} duplicated chalets`);
console.log(`Filtered chalets: ${filteredChalets.length}`);