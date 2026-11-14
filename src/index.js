import fs from 'node:fs';

import calculateDeliveryCost, { calculateBonus1, calculateBonus2 } from './calculate.js';
import { validateDelivery, validatePayment } from './validate.js';
import readCustomOptions from './input.js';
import { writeResults, writeErrors, writeBonus1, writeBonus2 } from './output.js';

const shipments = JSON.parse(
    fs.readFileSync('shipments.json', 'utf8')
);

const payments = JSON.parse(
    fs.readFileSync('payments.json', 'utf8')
);


const seenIds = new Set();

const validShipments = [];
const results1 = [];
const results2 = [];
const errors = [];


//task 1
for (const shipment of shipments) {
    const error = validateDelivery(shipment, seenIds);
    if (error) {
        errors.push({ id: shipment.id, error });
        continue;
    }
    validShipments.push(shipment);
    const result1 = calculateDeliveryCost(shipment);
    results1.push({ id: shipment.id, ...result1 });
}
writeResults(results1, 'task1.csv');
writeErrors(errors);


//task 2
const { customVat, customExcise, parsedStartDate, parsedEndDate } = await readCustomOptions();

for (const shipment of validShipments) {
    const result2 = calculateDeliveryCost(shipment, { vat: customVat, excise: customExcise });
    results2.push({ id: shipment.id, ...result2 });
}

writeResults(results2, 'task2.csv');

//bonus 1
const { count, mostExpensiveShipment, vatSum } = calculateBonus1(results2, parsedStartDate, parsedEndDate);
writeBonus1(count, mostExpensiveShipment, vatSum, 'bonus1.csv');


//bonus 2
const validPayments = [];

for (const payment of payments) {
    const error = validatePayment(payment);
    if (error) {
        //ignore invalid payments
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

