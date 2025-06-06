interface LogLevel {
  DEBUG: 'debug';
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
}

type LogLevelType = LogLevel[keyof LogLevel];

class Logger {
  private isProduction: boolean;
  private enabledLevels: Set<LogLevelType>;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    
    // 환경변수로 로그 레벨 제어 가능
    const logLevel = process.env.LOG_LEVEL?.toLowerCase();
    
    if (logLevel) {
      // 명시적으로 로그 레벨이 설정된 경우
      switch (logLevel) {
        case 'debug':
          this.enabledLevels = new Set(['debug', 'info', 'warn', 'error']);
          break;
        case 'info':
          this.enabledLevels = new Set(['info', 'warn', 'error']);
          break;
        case 'warn':
          this.enabledLevels = new Set(['warn', 'error']);
          break;
        case 'error':
          this.enabledLevels = new Set(['error']);
          break;
        case 'none':
          this.enabledLevels = new Set([]);
          break;
        default:
          // 기본값으로 fallback
          this.enabledLevels = new Set(
            this.isProduction ? ['error'] : ['debug', 'info', 'warn', 'error']
          );
      }
    } else {
      // 환경변수가 없으면 기본 동작
      this.enabledLevels = new Set(
        this.isProduction 
          ? ['error'] // Production: 에러만 출력
          : ['debug', 'info', 'warn', 'error'] // Development: 모든 로그 출력
      );
    }
  }

  private shouldLog(level: LogLevelType): boolean {
    return this.enabledLevels.has(level);
  }

  private formatMessage(level: LogLevelType, message: string, ...args: unknown[]): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}][${level.toUpperCase()}]`;
    
    switch (level) {
      case 'debug':
        console.log(prefix, message, ...args);
        break;
      case 'info':
        console.info(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'error':
        console.error(prefix, message, ...args);
        break;
    }
  }

  // Public 메서드들
  debug(message: string, ...args: unknown[]): void {
    this.formatMessage('debug', message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.formatMessage('info', message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.formatMessage('warn', message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    this.formatMessage('error', message, ...args);
  }

  // 기존 console.log 호환을 위한 헬퍼
  log(message: string, ...args: unknown[]): void {
    this.debug(message, ...args);
  }
}

// 싱글톤 인스턴스 생성
export const logger = new Logger();

// 편의를 위한 네임드 익스포트
export const { debug, info, warn, error, log } = logger; 