import Decimal from 'decimal.js';
import readline from 'node:readline';
import { parse, isValid, format } from 'date-fns';

export default async function readCustomOptions() {
    const rl = readline.createInterface({
        input: process.stdin
    });

    const lines = rl[Symbol.asyncIterator]();

    const formats = ['yyyy-MM-dd', 'dd/MM/yyyy'];
    const parseInputDate = value => {
        if (typeof value !== 'string') return undefined;
        return formats
            .map(pattern => ({ pattern, date: parse(value, pattern, new Date(2000, 0, 1)) }))
            .find(({ pattern, date }) => isValid(date) && format(date, pattern) === value)?.date;
    };

    let vat, excise, startDate, endDate;
    let parsedStartDate, parsedEndDate;

    while(true) {
        process.stdout.write('Enter VAT: ');
        ({ value: vat } = await lines.next());
        process.stdout.write('Enter Excise: ');
        ({ value: excise } = await lines.next());
        process.stdout.write('Enter Start Date (yyyy-MM-dd or dd/MM/yyyy): ');
        ({ value: startDate } = await lines.next());
        process.stdout.write('Enter End Date (yyyy-MM-dd or dd/MM/yyyy): ');
        ({ value: endDate } = await lines.next());
        if ([vat, excise, startDate, endDate].some(value => value === undefined)) {
            rl.close();
            throw new Error('Input ended before all required answers were received.');
        }
        parsedStartDate = parseInputDate(startDate);
        parsedEndDate = parseInputDate(endDate);
        if (!parsedStartDate || !parsedEndDate) {
            console.log('Invalid date format. Please try again.');
            continue;
        }
        if (parsedStartDate > parsedEndDate) {
            console.log('End Date must be on or after Start Date. Please try again.');
            continue;
        }
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

        console.log(`Start Date: ${format(parsedStartDate, 'yyyy-MM-dd')}`);
        console.log(`End Date: ${format(parsedEndDate, 'yyyy-MM-dd')}`);
        break;
    }

    rl.close();

    const customVat = new Decimal(vat).dividedBy(100);
    const customExcise = new Decimal(excise);

    return { customVat, customExcise, parsedStartDate, parsedEndDate };
}
