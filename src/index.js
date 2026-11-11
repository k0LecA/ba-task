import Decimal from 'decimal.js';
import calculateDeliveryCost from './calculate.js';
import fs from 'node:fs';
import validateDelivery from './validate.js';
import readline from 'node:readline/promises';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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

while(true) {
    const vat = await rl.question('Enter custom VAT rate for Private clients (%): ');
    const excise = await rl.question('Enter custom Excise rate for Gasoline: ');

    if(isNaN(vat) || isNaN(excise)) {
        console.log('Invalid input. Please enter numeric values.');
        continue;
    }

    if(Number(vat) < 0) {
        console.log('Invalid VAT rate. Please enter a non-negative value.');
        continue;
    }
    if(Number(excise) < 0) {
        console.log('Invalid Excise rate. Please enter a non-negative value.');
        continue;
    }

    break;
}

//const vat = await rl.question('Enter custom VAT rate for Private clients (%): ');
//const excise = await rl.question('Enter custom Excise rate for Gasoline: ');

//rl.close();

const customVat = new Decimal(vat).dividedBy(100);
const customExcise = new Decimal(excise);

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
