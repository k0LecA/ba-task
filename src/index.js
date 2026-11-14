import calculateDeliveryCost, { calculateBonus1, calculateBonus2 } from './calculate.js';
import fs from 'node:fs';
import validateDelivery, { validatePayment } from './validate.js';
import readCustomOptions from './input.js';
import { writeResults, writeErrors, writeBonus1, writeBonus2 } from './output.js';

const shipments = JSON.parse(
    fs.readFileSync('shipments.json', 'utf8')
);

const { customVat, customExcise,parsedStartDate, parsedEndDate } = await readCustomOptions();


const seenIds = new Set();

const results1 = [];
const results2 = [];
const errors = [];

for (const shipment of shipments) {
    const error = validateDelivery(shipment, seenIds);
    if (error) {
        errors.push({ id: shipment.id, error });
        continue;
    }
    const result1 = calculateDeliveryCost(shipment);
    const result2 = calculateDeliveryCost(shipment, { vat: customVat, excise: customExcise });
    results1.push({ id: shipment.id, ...result1 });
    results2.push({ id: shipment.id, date: shipment.date, ...result2 });
}
writeResults(results1, 'task1.csv');
writeResults(results2, 'task2.csv');
const { count, mostExpensiveShipment, vatSum } = calculateBonus1(results2, parsedStartDate, parsedEndDate);
writeBonus1(count, mostExpensiveShipment, vatSum, 'bonus1.csv');

const payments = JSON.parse(
    fs.readFileSync('payments.json', 'utf8')
);

const validPayments = [];

for (const payment of payments) {
    const error = validatePayment(payment);
    if (error) {
        //errors.push({ id: payment?.id, error });
        continue;
    }
    validPayments.push(payment);
}

const bonus2 = [];

for (const delivery of results1) {
    const payment = validPayments.find(payment => payment.id === delivery.id);
    bonus2.push(calculateBonus2(delivery, payment));
}

writeBonus2(bonus2);

