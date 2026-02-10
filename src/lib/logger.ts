export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
    level: LogLevel;
    message: string;
    data?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    timestamp: string;
    context?: string;
}

class LoggerService {
    private format(level: LogLevel, message: string, data?: any, context?: string): LogEntry { // eslint-disable-line @typescript-eslint/no-explicit-any
        return {
            level,
            message,
            data,
            context,
            timestamp: new Date().toISOString()
        };
    }

    private print(entry: LogEntry) {
        const { level, message, data, context, timestamp } = entry;
        // In production, this might be JSON.stringify(entry)
        // In dev, we want readable output
        const prefix = `[${timestamp}] [${level.toUpperCase()}]${context ? ` [${context}]` : ''}`;

        switch (level) {
            case 'info':
                console.info(prefix, message, data || '');
                break;
            case 'warn':
                console.warn(prefix, message, data || '');
                break;
            case 'error':
                console.error(prefix, message, data || '');
                break;
            case 'debug':
                console.debug(prefix, message, data || '');
                break;
        }
    }

    info(message: string, data?: any, context?: string) { // eslint-disable-line @typescript-eslint/no-explicit-any
        this.print(this.format('info', message, data, context));
    }

    warn(message: string, data?: any, context?: string) { // eslint-disable-line @typescript-eslint/no-explicit-any
        this.print(this.format('warn', message, data, context));
    }

    error(message: string, data?: any, context?: string) { // eslint-disable-line @typescript-eslint/no-explicit-any
        this.print(this.format('error', message, data, context));
    }

    debug(message: string, data?: any, context?: string) { // eslint-disable-line @typescript-eslint/no-explicit-any
        this.print(this.format('debug', message, data, context));
    }
}

export const Logger = new LoggerService();
