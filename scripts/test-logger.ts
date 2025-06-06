#!/usr/bin/env tsx

import { logger } from '../lib/logger';

console.log('=== 로거 테스트 시작 ===');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`LOG_LEVEL: ${process.env.LOG_LEVEL || '(설정되지 않음)'}`);
console.log('');

console.log('=== 모든 로그 레벨 테스트 ===');
logger.debug('이것은 DEBUG 메시지입니다');
logger.info('이것은 INFO 메시지입니다');
logger.warn('이것은 WARN 메시지입니다');
logger.error('이것은 ERROR 메시지입니다');
logger.log('이것은 LOG 메시지입니다 (debug와 동일)');

console.log('');
console.log('=== 추가 인자 테스트 ===');
const testObject = { key: 'value', number: 42 };
const testError = new Error('테스트 에러');

logger.error('객체와 에러 테스트:', testObject, testError);

console.log('');
console.log('=== 로거 테스트 완료 ==='); 