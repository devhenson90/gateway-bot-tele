import { ConsoleLogger, LogLevel } from '@nestjs/common';
import {
  isString,
  isUndefined,
  slice,
  each,
  isFunction,
  isObject,
} from 'lodash';
import { ClsClient } from 'artifacts/cls/cls.client';
import { safeJsonStringify } from '../helper/logging.helper';

const CLS = new ClsClient();

export enum NestLogLevel {
  Log = 'log',
  Error = 'error',
}

export class NestLogger extends ConsoleLogger {
  private readonly isColorAllowed = !process.env.NO_COLOR ? true : false;

  log(message: any, ...optionalParams: any[]) {
    if (!this.isLevelEnabled(NestLogLevel.Log)) {
      return;
    }
    const { messages, context } = this.prepareToContextPrint([
      message,
      ...optionalParams,
    ]);

    this.printMessages(
      this.joinSingleLine(messages, NestLogLevel.Log),
      context,
      NestLogLevel.Log,
    );
  }

  error(message: any, ...optionalParams: any[]) {
    if (!this.isLevelEnabled(NestLogLevel.Error)) {
      return;
    }
    const { messages, context, stack } = this.prepareToStackPrint([
      message,
      ...optionalParams,
    ]);

    this.printMessages(
      this.joinSingleLine(messages, NestLogLevel.Error),
      context,
      NestLogLevel.Error,
      'stderr',
    );
    this.printStackTrace(stack);
  }

  protected formatPid(): string {
    return `[Nest] ${
      CLS.isActive() ? CLS.getId().replace(/-/g, '') : 'Default'
    }  - `;
  }

  protected printStackTrace(stack: string) {
    if (!stack) {
      return;
    }
    const prefixStack = this.formatPid();
    const stackMessages = stack.split(/\n/g);
    each(slice(stackMessages, 1), (msg) => {
      process.stderr.write(
        `${this.colorize(prefixStack, NestLogLevel.Error)}${msg}\n`,
      );
    });
  }

  protected getTimestamp(): string {
    if (this.isColorAllowed) {
      return super.getTimestamp();
    }
    return '';
  }

  private prepareToContextPrint(args: unknown[]) {
    if (args?.length <= 1) {
      return { messages: args, context: this.context };
    }
    const lastElement = args[args.length - 1];
    const isContext = isString(lastElement);
    if (!isContext) {
      return { messages: args, context: this.context };
    }
    return {
      context: lastElement as string,
      messages: args.slice(0, args.length - 1),
    };
  }

  private isStackTraceFormat(stack: unknown) {
    if (!isString(stack) && !isUndefined(stack)) {
      return false;
    }

    return /^(.)+\s+at .+:\d+:.+$/m.test(stack);
  }

  private prepareToStackPrint(args: unknown[]) {
    if (args.length === 2) {
      return this.isStackTraceFormat(args[1])
        ? {
            messages: [args[0]],
            stack: args[1] as string,
            context: this.context,
          }
        : {
            messages: [args[0]],
            context: args[1] as string,
          };
    }

    const { messages, context } = this.prepareToContextPrint(args);
    if (messages?.length <= 1) {
      return { messages, context };
    }
    const lastElement = messages[messages.length - 1];
    const isStack =
      isString(lastElement) && this.isStackTraceFormat(lastElement);
    // https://github.com/nestjs/nest/issues/11074#issuecomment-1421680060
    if (!isStack && !isUndefined(lastElement)) {
      return { messages, context };
    }
    return {
      stack: lastElement as string,
      messages: messages.slice(0, messages.length - 1),
      context,
    };
  }

  protected stringifyMessage(message: any, logLevel: LogLevel) {
    if (isFunction(message)) {
      const messageAsStr = Function.prototype.toString.call(message);
      const isClass = messageAsStr.startsWith('class ');
      if (isClass) {
        // If the message is a class, we will display the class name.
        return this.stringifyMessage(message.name, logLevel);
      }
      // If the message is a non-class function, call it and re-resolve its value.
      return this.stringifyMessage(message(), logLevel);
    }

    if (message instanceof Error) {
      return this.colorize(message as any as string, logLevel);
    }

    return isObject(message) || Array.isArray(message)
      ? `${this.colorize('Object:', logLevel)}\n${safeJsonStringify(
          message,
          (key, value) =>
            typeof value === 'bigint' ? value.toString() : value,
          2,
        )}\n`
      : this.colorize(message as string, logLevel);
  }

  private joinSingleLine(messages: unknown[], logLevel) {
    let msg = '';
    messages.forEach((message) => {
      const output = this.stringifyMessage(message, logLevel);
      msg += ' ' + (output?.replace ? output.replace(/\s+/g, ' ') : output);
    });
    return [msg];
  }
}
