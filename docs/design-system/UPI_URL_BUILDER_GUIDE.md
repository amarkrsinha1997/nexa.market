# UPI URL Builder - Usage Guide

## Overview

The `UPIUrlBuilder` class provides a clean, type-safe way to construct UPI payment deep links according to NPCI specifications.

## Basic Usage

```typescript
import { UPIUrlBuilder } from '@/lib/utils/upi-url-builder';

// Simple payment link
const url = new UPIUrlBuilder("merchant@bank")
  .setAmount(500)
  .setPayeeName("Nexa Market")
  .build();

// Result: upi://pay?pa=merchant@bank&pn=Nexa%20Market&am=500&cu=INR
```

## Complete Example

```typescript
const upiUrl = new UPIUrlBuilder("nexaindia@slc")
  .setPayeeName("Nexa Market")
  .setAmount(1000)
  .setCurrency("INR")
  .setTransactionNote("NEXA Token Purchase - Order ABC123")
  .setTransactionRef("ORDER-ABC123-XYZ")
  .setMerchantCode("5411")
  .setMode("01") // QR code mode
  .build();

// Result: upi://pay?pa=nexaindia@slc&pn=Nexa%20Market&am=1000&cu=INR&tn=NEXA%20Token%20Purchase%20-%20Order%20ABC123&tr=ORDER-ABC123-XYZ&mc=5411&mode=01
```

## Quick Helper Method

For simple use cases, use the static helper:

```typescript
const url = UPIUrlBuilder.createSimple(
  "merchant@bank",
  500,
  "Payment for Order #123"
);
```

## Available Parameters

| Parameter | Method | Description | Required |
|-----------|--------|-------------|----------|
| VPA | Constructor | Virtual Payment Address | ✅ Yes |
| Payee Name | `setPayeeName()` | Merchant/Business name | ❌ No |
| Amount | `setAmount()` | Transaction amount | ❌ No |
| Currency | `setCurrency()` | Currency code (default: INR) | ❌ No |
| Transaction Note | `setTransactionNote()` | Payment description | ❌ No |
| Transaction Ref | `setTransactionRef()` | Order/Transaction ID | ❌ No |
| Merchant Code | `setMerchantCode()` | Merchant category code | ❌ No |
| Mode | `setMode()` | Transaction mode (00/01) | ❌ No |
| Purpose | `setPurpose()` | Purpose code (RBI) | ❌ No |
| Org ID | `setOrgId()` | Organization identifier | ❌ No |

## Method Chaining

All setter methods return the builder instance, allowing for fluent method chaining:

```typescript
const url = new UPIUrlBuilder("merchant@bank")
  .setPayeeName("My Store")
  .setAmount(250)
  .setTransactionNote("Product Purchase")
  .setTransactionRef("TXN123")
  .build();
```

## Getting Current Parameters

```typescript
const builder = new UPIUrlBuilder("merchant@bank")
  .setAmount(500)
  .setPayeeName("Store");

const params = builder.getParams();
console.log(params);
// { vpa: "merchant@bank", amount: 500, payeeName: "Store" }
```

## UPI Deep Link Specification

The generated URLs follow the NPCI UPI Deep Linking specification:

**Format**: `upi://pay?pa=<VPA>&pn=<Name>&am=<Amount>&cu=<Currency>&tn=<Note>&tr=<Ref>`

**Reference**: [NPCI UPI Specifications](https://www.npci.org.in/what-we-do/upi/upi-specifications)

## Common Use Cases

### E-commerce Checkout
```typescript
const checkoutUrl = new UPIUrlBuilder("store@bank")
  .setPayeeName("My E-Store")
  .setAmount(orderTotal)
  .setTransactionNote(`Order #${orderId}`)
  .setTransactionRef(orderId)
  .build();
```

### Subscription Payment
```typescript
const subscriptionUrl = new UPIUrlBuilder("service@bank")
  .setPayeeName("Premium Service")
  .setAmount(999)
  .setTransactionNote("Monthly Subscription - January 2026")
  .setTransactionRef(`SUB-${userId}-${month}`)
  .build();
```

### Donation/Contribution
```typescript
const donationUrl = new UPIUrlBuilder("charity@bank")
  .setPayeeName("Charity Organization")
  .setAmount(donationAmount)
  .setTransactionNote(`Donation from ${donorName}`)
  .build();
```

## Security Notes

- ✅ All parameters are properly URL-encoded
- ✅ VPA is validated as required parameter
- ✅ Amount is handled as number type to prevent injection
- ✅ Special characters in notes/names are safely encoded

## Integration Example (API Route)

```typescript
import { UPIUrlBuilder } from '@/lib/utils/upi-url-builder';

export async function POST(req: Request) {
  const { orderId, amount, merchantVPA } = await req.json();
  
  const upiUrl = new UPIUrlBuilder(merchantVPA)
    .setPayeeName("Your Store Name")
    .setAmount(amount)
    .setTransactionNote(`Order ${orderId}`)
    .setTransactionRef(orderId)
    .build();
  
  return Response.json({ upiUrl });
}
```

## Testing

You can test the generated URLs by:
1. Opening them on a mobile device with UPI apps installed
2. Scanning QR codes generated from the URLs
3. Using UPI testing tools provided by payment gateways

## Troubleshooting

**Issue**: UPI app doesn't open
- Ensure the VPA format is correct (username@bank)
- Check that all parameters are properly encoded
- Verify the UPI app is installed and updated

**Issue**: Amount not pre-filled
- Confirm amount is a valid number
- Check that currency is set (defaults to INR)

**Issue**: Transaction note not showing
- Some UPI apps have character limits for notes
- Keep transaction notes concise (< 100 characters recommended)
