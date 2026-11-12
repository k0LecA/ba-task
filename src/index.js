import calculateDeliveryCost from './calculate.js';
import fs from 'node:fs';
import validateDelivery from './validate.js';
import readCustomOptions from './input.js';

const shipments = JSON.parse(
    fs.readFileSync('example.json', 'utf8')
);

const seenIds = new Set();

const t1rows = [
    'Jonas Butrimas',
    'ShipmentID,NetFuelPrice,LogisticsCost,TotalTax,GrandTotal'
];

const errorRows = [
    'Jonas_Butrimas',
    'ShipmentID,ErrorCode'
]

for (const shipment of shipments) {
    const error = validateDelivery(shipment, seenIds);
    if (error) {
        errorRows.push(`${shipment.id},${error}`);
        continue;
    }
    const result = calculateDeliveryCost(shipment);
    t1rows.push(`${shipment.id},${result.netFuelPrice.toFixed(2)},${result.logisticsCost.toFixed(2)},${result.totalTax.toFixed(2)},${result.grandTotal.toFixed(2)}`);
}

fs.mkdirSync('output', { recursive: true });
fs.writeFileSync('output/task1.csv', t1rows.join('\n'));
fs.writeFileSync('output/task1_errors.csv', errorRows.join('\n'));

const { customVat, customExcise } = await readCustomOptions();

seenIds.clear();

const t2rows = [
    'Jonas Butrimas',
    'ShipmentID,NetFuelPrice,LogisticsCost,TotalTax,GrandTotal'
];

for (const shipment of shipments) {
    const error = validateDelivery(shipment, seenIds);
    if (error) {
        errorRows.push(`${shipment.id},${error}`);
        continue;
    }
    const result = calculateDeliveryCost(shipment, { vat: customVat, excise: customExcise });
    t2rows.push(`${shipment.id},${result.netFuelPrice.toFixed(2)},${result.logisticsCost.toFixed(2)},${result.totalTax.toFixed(2)},${result.grandTotal.toFixed(2)}`);
}
fs.writeFileSync('output/task2.csv', t2rows.join('\n'));
