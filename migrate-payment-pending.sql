-- SQL script to check and update any remaining PAYMENT_PENDING orders
-- Run this in your database if needed

-- Check for any PAYMENT_PENDING orders
SELECT id, status, "createdAt"
FROM "Order"
WHERE
    status = 'PAYMENT_PENDING';

-- If any exist, update them to VERIFICATION_PENDING
-- UPDATE "Order"
-- SET status = 'VERIFICATION_PENDING'
-- WHERE status = 'PAYMENT_PENDING';