import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me"
const JWT_EXPIRES_IN = "7d"

export type UserRole = "user" | "provider" | "admin"

export interface AuthTokenPayload {
	id: string
	email: string
	role: UserRole
}

export function signAuthToken(payload: AuthTokenPayload) {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
	try {
		return jwt.verify(token, JWT_SECRET) as AuthTokenPayload
	} catch {
		return null
	}
}

export async function hashPassword(plain: string) {
	const salt = await bcrypt.genSalt(10)
	return bcrypt.hash(plain, salt)
}

export async function comparePassword(plain: string, hashed: string) {
	return bcrypt.compare(plain, hashed)
}


