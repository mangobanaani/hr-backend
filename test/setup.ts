// Mock PrismaService for tests
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  employee: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  department: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $transaction: jest.fn(),
};

// Global test setup
beforeAll(async () => {
  // Setup global test environment
});

afterAll(async () => {
  // Cleanup global test environment
});

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
});

export { mockPrismaService };
