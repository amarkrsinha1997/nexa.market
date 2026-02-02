import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "default-refresh-secret";

export async function signAccessToken(payload: any) {
    const secret = new TextEncoder().encode(JWT_SECRET);
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("15m") // 15 minutes
        .sign(secret);
}

export async function signRefreshToken(payload: any) {
    const secret = new TextEncoder().encode(JWT_REFRESH_SECRET);
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d") // 7 days
        .sign(secret);
}

export async function verifyAccessToken(token: string) {
    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error) {
        return null;
    }
}

export async function verifyRefreshToken(token: string) {
    try {
        const secret = new TextEncoder().encode(JWT_REFRESH_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error) {
        return null;
    }
}
