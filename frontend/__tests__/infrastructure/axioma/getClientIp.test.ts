import { describe, expect, it } from 'vitest';
import { getClientIp } from '@/infrastructure/axioma/getClientIp';

function requestWithHeaders(headers: Record<string, string>): Request {
    return new Request('http://localhost/api/axioma/analyze', { headers });
}

describe('getClientIp', () => {
    it('extrai o primeiro IP de x-forwarded-for com múltiplos IPs', () => {
        const request = requestWithHeaders({ 'x-forwarded-for': '203.0.113.1, 10.0.0.1, 10.0.0.2' });
        expect(getClientIp(request)).toBe('203.0.113.1');
    });

    it('remove espaços ao redor do IP em x-forwarded-for', () => {
        const request = requestWithHeaders({ 'x-forwarded-for': '  203.0.113.5  ,10.0.0.1' });
        expect(getClientIp(request)).toBe('203.0.113.5');
    });

    it('usa x-real-ip quando x-forwarded-for não está presente', () => {
        const request = requestWithHeaders({ 'x-real-ip': '198.51.100.7' });
        expect(getClientIp(request)).toBe('198.51.100.7');
    });

    it('prioriza x-forwarded-for sobre x-real-ip quando ambos presentes', () => {
        const request = requestWithHeaders({ 'x-forwarded-for': '203.0.113.1', 'x-real-ip': '198.51.100.7' });
        expect(getClientIp(request)).toBe('203.0.113.1');
    });

    it('retorna "unknown" quando nenhum header de IP está presente', () => {
        const request = requestWithHeaders({});
        expect(getClientIp(request)).toBe('unknown');
    });
});
