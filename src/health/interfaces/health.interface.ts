export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: boolean;
    memory: boolean;
  };
}

export interface DatabaseHealthResponse {
  status: 'healthy' | 'unhealthy';
  responseTime: number;
  connected: boolean;
  timestamp: string;
}

export interface SystemHealthResponse {
  status: 'healthy' | 'degraded';
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
}
