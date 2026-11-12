import calculateDeliveryCost from './calculate.js';
import fs from 'node:fs';
import validateDelivery from './validate.js';
import readCustomOptions from './input.js';
import { writeResults, writeErrors } from './output.js';

const shipments = JSON.parse(
    fs.readFileSync('example.json', 'utf8')
);

const { customVat, customExcise } = await readCustomOptions();


const seenIds = new Set();

const results1 = [];
const results2 = [];
const errors = [];

for (const shipment of shipments) {
    const error = validateDelivery(shipment, seenIds);
    if (error) {
        errors.push({ id: shipment.id, error });
        writeErrors(errors);
        continue;
    }
    const result1 = calculateDeliveryCost(shipment);
    const result2 = calculateDeliveryCost(shipment, { vat: customVat, excise: customExcise });
    results1.push({ id: shipment.id, ...result1 });
    results2.push({ id: shipment.id, ...result2 });
    writeResults(results1, 'task1.csv');
    writeResults(results2, 'task2.csv');
}