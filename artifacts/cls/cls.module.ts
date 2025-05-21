import { Module } from '@nestjs/common';
import { ClsModule as NestClsModule } from 'nestjs-cls';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    NestClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: () => uuidv4(),
      },
    }),
  ],
  controllers: [],
  providers: [],
  exports: [NestClsModule],
})
export class ClsAdapterModule {}
