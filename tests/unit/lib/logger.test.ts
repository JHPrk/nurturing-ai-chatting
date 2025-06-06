import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 로거 모듈을 동적으로 import하기 위해 mock을 먼저 설정
const mockConsole = {
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// console 메서드들을 mock
vi.stubGlobal('console', mockConsole);

describe('Logger 유틸리티', () => {
  beforeEach(() => {
    // 각 테스트 전에 mock 초기화
    vi.clearAllMocks();
    // 모듈 캐시 초기화
    vi.resetModules();
  });

  it('Development 환경에서는 모든 로그 레벨이 출력된다', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    
    // 동적 import로 새로운 로거 인스턴스 생성
    const { logger } = await import('@lib/logger');
    
    logger.debug('디버그 메시지');
    logger.info('정보 메시지');
    logger.warn('경고 메시지');
    logger.error('에러 메시지');

    expect(mockConsole.log).toHaveBeenCalledWith(
      expect.stringContaining('[DEBUG]'),
      '디버그 메시지'
    );
    expect(mockConsole.info).toHaveBeenCalledWith(
      expect.stringContaining('[INFO]'),
      '정보 메시지'
    );
    expect(mockConsole.warn).toHaveBeenCalledWith(
      expect.stringContaining('[WARN]'),
      '경고 메시지'
    );
    expect(mockConsole.error).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR]'),
      '에러 메시지'
    );
  });

  it('Production 환경에서는 에러만 출력된다', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    
    const { logger } = await import('@lib/logger');
    
    logger.debug('디버그 메시지');
    logger.info('정보 메시지');
    logger.warn('경고 메시지');
    logger.error('에러 메시지');

    expect(mockConsole.log).not.toHaveBeenCalled();
    expect(mockConsole.info).not.toHaveBeenCalled();
    expect(mockConsole.warn).not.toHaveBeenCalled();
    expect(mockConsole.error).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR]'),
      '에러 메시지'
    );
  });

  it('LOG_LEVEL=warn 설정 시 warn과 error만 출력된다', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('LOG_LEVEL', 'warn');
    
    const { logger } = await import('@lib/logger');
    
    logger.debug('디버그 메시지');
    logger.info('정보 메시지');
    logger.warn('경고 메시지');
    logger.error('에러 메시지');

    expect(mockConsole.log).not.toHaveBeenCalled();
    expect(mockConsole.info).not.toHaveBeenCalled();
    expect(mockConsole.warn).toHaveBeenCalledWith(
      expect.stringContaining('[WARN]'),
      '경고 메시지'
    );
    expect(mockConsole.error).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR]'),
      '에러 메시지'
    );
  });

  it('LOG_LEVEL=none 설정 시 모든 로그가 비활성화된다', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('LOG_LEVEL', 'none');
    
    const { logger } = await import('@lib/logger');
    
    logger.debug('디버그 메시지');
    logger.info('정보 메시지');
    logger.warn('경고 메시지');
    logger.error('에러 메시지');

    expect(mockConsole.log).not.toHaveBeenCalled();
    expect(mockConsole.info).not.toHaveBeenCalled();
    expect(mockConsole.warn).not.toHaveBeenCalled();
    expect(mockConsole.error).not.toHaveBeenCalled();
  });

  it('잘못된 LOG_LEVEL 설정 시 기본값으로 fallback된다', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('LOG_LEVEL', 'invalid_level');
    
    const { logger } = await import('@lib/logger');
    
    logger.debug('디버그 메시지');
    logger.error('에러 메시지');

    // Production 기본값(error만)으로 동작해야 함
    expect(mockConsole.log).not.toHaveBeenCalled();
    expect(mockConsole.error).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR]'),
      '에러 메시지'
    );
  });

  it('로그 메시지에 타임스탬프가 포함된다', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    
    const { logger } = await import('@lib/logger');
    
    logger.info('테스트 메시지');

    expect(mockConsole.info).toHaveBeenCalledWith(
      expect.stringMatching(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]\[INFO\]$/),
      '테스트 메시지'
    );
  });

  it('log() 메서드는 debug() 메서드와 동일하게 동작한다', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    
    const { logger } = await import('@lib/logger');
    
    logger.log('로그 메시지');

    expect(mockConsole.log).toHaveBeenCalledWith(
      expect.stringContaining('[DEBUG]'),
      '로그 메시지'
    );
  });

  it('추가 인자들도 올바르게 전달된다', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    
    const { logger } = await import('@lib/logger');
    
    const errorObj = new Error('테스트 에러');
    logger.error('에러 발생:', errorObj, { context: 'test' });

    expect(mockConsole.error).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR]'),
      '에러 발생:',
      errorObj,
      { context: 'test' }
    );
  });
}); 