import Decimal from 'decimal.js';
import calculateDeliveryCost from './calculate.js';
import fs from 'node:fs';
import validateDelivery from './validate.js';

const shipments = JSON.parse(
    fs.readFileSync('shipments.json', 'utf8')
);

const seenIds = new Set();

for (const shipment of shipments) {
    const error = validateDelivery(shipment, seenIds);
    if (error) {
        console.log(shipment.id, error);
        continue;
    }
    const result = calculateDeliveryCost(shipment);
    console.log(result);
}