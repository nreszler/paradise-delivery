import { PrismaClient } from './client';

export * from './client';

// Create a singleton Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Re-export types
export type {
  User,
  Order,
  Restaurant,
  RefundRiskScore,
  CustomerRefundStats,
  FraudPattern,
  RefundRequest,
  ErrorCharge,
  Delivery,
  DriverProfile,
  WeeklyTrueUp,
  OrderStatus,
  PaymentStatus,
  RefundStatus,
  RefundDecision,
  RiskLevel,
  ErrorReason,
  DisputeStatus,
  RefundReason,
} from './client';
