import Decimal from 'decimal.js';
import calculateDeliveryCost from './calculate.js';
import fs from 'node:fs';
import validateDelivery from './validate.js';

const shipments = JSON.parse(
    fs.readFileSync('shipments.json', 'utf8')
);

//console.log(shipments);

//console.log(shipments[0]);

//console.log(calculateDeliveryCost(shipments));

for (const shipment of shipments) {
    if(!validateDelivery(shipment)) {
        console.log(`Invalid shipment data for ID: ${shipment.id}`);
        continue;
    }
    const result = calculateDeliveryCost(shipment);
    console.log(result);
}