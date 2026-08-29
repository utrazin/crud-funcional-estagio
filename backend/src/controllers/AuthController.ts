import bcrypt from 'bcryptjs'
import { prisma } from '../prisma'
import { signToken } from '../utils/jwt'

export class AuthController {
  private userRepository = prisma.user

  async login(email: string, password: string) {
    if (!email || !email.trim()) throw new Error('E-mail é obrigatório')
    if (!password) throw new Error('Senha é obrigatória')

    const user = await this.userRepository.findUnique({ where: { email: email.trim().toLowerCase() } })
    if (!user) throw new Error('Credenciais inválidas')

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) throw new Error('Credenciais inválidas')

    const token = signToken({ userId: user.id })
    return { token, user: this.toSafeUser(user) }
  }

  async me(userId: string) {
    const user = await this.userRepository.findUnique({ where: { id: userId } })
    if (!user) throw new Error('Usuário não encontrado')
    return this.toSafeUser(user)
  }

  private toSafeUser(user: { id: string; email: string; name: string; role: string }) {
    return { id: user.id, email: user.email, name: user.name, role: user.role }
  }
}
