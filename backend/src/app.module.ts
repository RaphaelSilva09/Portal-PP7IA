import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PortalModule } from './modules/portal/portal.module';

@Module({
  imports: [PortalModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
