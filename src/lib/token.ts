import {JWTPayload, jwtVerify, SignJWT} from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function generateToken(payload: JWTPayload, expiresInSeconds = '2h') {
    return new SignJWT(payload)
        .setProtectedHeader({alg: 'HS256', typ: 'JWT'})
        .setIssuedAt()
        .setExpirationTime(expiresInSeconds)
        .sign(secret);
}

export async function verifyToken(token: string) {
    try {
        console.log(token, secret, await jwtVerify(token, secret))
        const {payload} = await jwtVerify(token, secret);
        return payload; // payload est un objet avec tes données
    } catch (e) {
        console.error(e);
        return null;
    }
}