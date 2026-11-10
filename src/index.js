import Decimal from 'decimal.js';
import calculateDeliveryCost from './calculate.js';
import fs from 'node:fs';

const shipments = JSON.parse(
    fs.readFileSync('example.json', 'utf8')
);

//console.log(shipments);

//console.log(shipments[0]);

console.log(calculateDeliveryCost(shipments));
