import Decimal from 'decimal.js';

export default function calculateDeliveryCost(delivery) {
    const { type, client, volume, distance, basePrice } = delivery;
    
    const deliveryPrice= new Decimal(1.8);
    const smallLoadFee= new Decimal(150);

    const GASOLINE= new Decimal(0.47);
    const DIESEL= new Decimal(0.33);
    const LPG= new Decimal(0.18);

    const VATold= new Decimal(0.21);
    const VATnew= new Decimal(0.23);

    let discountRate;
    if(volume > 20000) {
        discountRate = new Decimal(0.10);
    } else if(volume > 5000) {
        discountRate = new Decimal(0.05);
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

    if(volume < 1000) {
        logisticsCost = logisticsCost.add(smallLoadFee);
    }

    const fuelType=type.trim().toUpperCase();

    const excise = new Decimal(volume)
        .mul(fuelType === 'GASOLINE' ? GASOLINE : fuelType === 'DIESEL' ? DIESEL : LPG)
        .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    let vat = new Decimal(netFuelPrice)
        .add(logisticsCost)
        .add(excise);

    if(client === 'EXEMPT') {
        vat = new Decimal(0);
    } else if(client === 'PRIVATE' && new Date(delivery.date) >= new Date('2024-01-01')) {
        vat = vat.mul(VATnew).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    } else if(client === 'PRIVATE' && new Date(delivery.date) < new Date('2024-01-01')) {
        vat = vat.mul(VATold).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    } else if(client === 'GOVERNMENT') {
        vat = new Decimal(0); //lol
    }

    const totalTax= new Decimal(excise).add(vat).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    const grandTotal= new Decimal(netFuelPrice).add(logisticsCost).add(totalTax).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    return {
        netFuelPrice,
        logisticsCost,
        excise,
        vat,
        totalTax,
        grandTotal
    };
}