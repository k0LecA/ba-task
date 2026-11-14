import Decimal from 'decimal.js';
import readline from 'node:readline';
import parseDate from './date.js';

export default async function readCustomOptions() {
    const rl = readline.createInterface({
        input: process.stdin
    });

    const lines = rl[Symbol.asyncIterator]();

    const readLine = async prompt => {
        process.stdout.write(prompt);
        const { value, done } = await lines.next();
        if (done) {
            throw new Error('Input ended before all required answers were received.');
        }
        return value.trim();
    };

    const readRate = async prompt => {
        while (true) {
            const value = await readLine(prompt);
            try {
                const rate = value === '' ? null : new Decimal(value);
                if (rate?.isFinite() && !rate.isNegative()) return rate;
            } catch {
                // Invalid decimal input is handled by the same retry below.
            }
            console.log('Invalid rate. Please enter a non-negative number.');
        }
    };

    const readDate = async (prompt, startDate) => {
        while (true) {
            const date = parseDate(await readLine(prompt));
            if (!date) {
                console.log('Invalid date format. Please try again.');
                continue;
            }
            if (startDate && date < startDate) {
                console.log('End Date must be on or after Start Date. Please try again.');
                continue;
            }
            return date;
        }
    };

    try {
        const customVat = (await readRate('Enter custom VAT rate for Private clients (%): ')).dividedBy(100);
        const customExcise = await readRate('Enter custom Excise rate for Gasoline: ');
        const parsedStartDate = await readDate('Enter Start Date (yyyy-MM-dd or dd/MM/yyyy): ');
        const parsedEndDate = await readDate('Enter End Date (yyyy-MM-dd or dd/MM/yyyy): ', parsedStartDate);

        return { customVat, customExcise, parsedStartDate, parsedEndDate };
    } finally {
        rl.close();
    }
}
