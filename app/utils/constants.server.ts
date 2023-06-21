const fundUnitText = process.env.FUND_UNIT;
if (!fundUnitText) {
    throw new Error("fund unit is not defined");
}
export const fundUnit = parseInt(fundUnitText);

export const maxInt64N = BigInt(Number.MAX_SAFE_INTEGER);