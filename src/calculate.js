import Decimal from 'decimal.js';
import { parse, addDays, isValid, differenceInCalendarDays, format } from 'date-fns';
import { PRICING, LATE_INTEREST } from './constants.js';

export function calculateBonus1(results, startDate, endDate) {
    let count = 0;
    let vatSum = new Decimal(0);
    let mostExpensiveShipment = null;

    for (const result of results) {
        const shipmentDate = ['yyyy-MM-dd', 'dd/MM/yyyy']
            .map(format => parse(result.date, format, new Date()))
            .find(date => isValid(date));

        if (shipmentDate >= startDate && shipmentDate <= endDate) {
            count++;
            vatSum = vatSum.add(result.vat);
            if (mostExpensiveShipment === null || result.grandTotal.gt(mostExpensiveShipment.grandTotal)) {
                mostExpensiveShipment = result;
            }
        }
    }

    return { count, mostExpensiveShipment, vatSum };
}

export function calculateBonus2(delivery, payment) {
    const reportDate = parse(LATE_INTEREST.reportDate, 'yyyy-MM-dd', new Date());
    const rateChangeDate = parse(LATE_INTEREST.rateChangeDate, 'yyyy-MM-dd', new Date());

    const deliveryDate = ['yyyy-MM-dd', 'dd/MM/yyyy'].map(fmt => parse(delivery.date, fmt, new Date())).find(date => isValid(date));

    const dueDate = addDays(deliveryDate, 30);

    let endDate = reportDate;

    if (payment) {
        endDate = ['yyyy-MM-dd', 'dd/MM/yyyy'].map(fmt => parse(payment.paidDate, fmt, new Date())).find(date => isValid(date));
    }

    const daysLate = Math.max(0, differenceInCalendarDays(endDate, dueDate));

    if (daysLate === 0) {
        return { id: delivery.id, dueDate: format(dueDate, 'yyyy-MM-dd'), daysLate: 0, lateInterest: new Decimal(0) };
    }

    const daysBefore = Math.min(
        daysLate,
        Math.max(0, differenceInCalendarDays(rateChangeDate, dueDate) - 1)
    );
    const daysAfter = daysLate - daysBefore;

    const lateInterest = new Decimal(delivery.grandTotal).mul(daysBefore).mul(LATE_INTEREST.yearlyRateBefore).div(365).plus(
            new Decimal(delivery.grandTotal).mul(daysAfter).mul(LATE_INTEREST.yearlyRateFrom).div(365)
        ).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    return { id: delivery.id, dueDate: format(dueDate, 'yyyy-MM-dd'), daysLate, lateInterest };
}

export default function calculateDeliveryCost(delivery, custom) {
    const { type, client, volume, distance, basePrice } = delivery;
    const { vat: customVat, excise: customExcise } = custom ?? { vat: undefined, excise: undefined };
    
    const deliveryPrice= new Decimal(PRICING.deliveryPerKm);
    const smallLoadFee= new Decimal(PRICING.smallLoadFee);

    let GASOLINE= new Decimal(PRICING.excise.GASOLINE);
    const DIESEL= new Decimal(PRICING.excise.DIESEL);
    const LPG= new Decimal(PRICING.excise.LPG);


    let VATold= new Decimal(PRICING.vatBefore);
    let VATnew= new Decimal(PRICING.vatFrom);

    if(custom!==undefined) {
        VATold = new Decimal(custom.vat);
        VATnew = new Decimal(custom.vat);
        GASOLINE = new Decimal(custom.excise);
    }

    let discountRate;
    if(volume > PRICING.largeDiscountLimit) {
        discountRate = new Decimal(PRICING.largeDiscountRate);
    } else if(volume > PRICING.discountLimit) {
        discountRate = new Decimal(PRICING.discountRate);
    } else {
        discountRate = new Decimal(0);
    }

    const netFuelPrice= new Decimal(basePrice)
        .mul(volume)
        .mul(new Decimal(1).sub(discountRate))
        .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);


    let logisticsCost = new Decimal(distance)
        .mul(deliveryPrice)
        .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    if(volume < PRICING.smallLoadLimit) {
        logisticsCost = logisticsCost.add(smallLoadFee).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    }

    const fuelType=type.trim().toUpperCase();
    const clientType = client.trim().toUpperCase();

    const excise = new Decimal(volume)
        .mul(fuelType === 'GASOLINE' ? GASOLINE : fuelType === 'DIESEL' ? DIESEL : LPG)
        .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    let vat = new Decimal(netFuelPrice)
        .add(logisticsCost)
        .add(excise);


    if(clientType === 'EXEMPT') {
        vat = new Decimal(0);
    } else if(clientType === 'PRIVATE' && new Date(delivery.date) >= new Date(PRICING.vatChangeDate)) {
        vat = vat.mul(VATnew).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    } else if(clientType === 'PRIVATE' && new Date(delivery.date) < new Date(PRICING.vatChangeDate)) {
        vat = vat.mul(VATold).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    }

    const totalTax= new Decimal(excise).add(vat).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    const grandTotal= new Decimal(netFuelPrice).add(logisticsCost).add(totalTax).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    return {
        netFuelPrice,
        logisticsCost,
        excise,
        vat,
        totalTax,
        grandTotal,
        date: delivery.date
    };
}
